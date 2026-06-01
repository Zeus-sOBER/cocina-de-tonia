"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Order, OrderItem } from "@/lib/supabase/types";
import type { OrderStatus, OrderSource } from "@/lib/utils/constants";

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export async function getOrders(
  date?: string,
  status?: OrderStatus
): Promise<OrderWithItems[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (date) {
      query = query.eq("delivery_date", date);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as OrderWithItems[]) ?? [];
  } catch {
    return [];
  }
}

export async function getTodaysOrders(): Promise<OrderWithItems[]> {
  const today = new Date().toISOString().split("T")[0];
  return getOrders(today);
}

export async function getOrder(id: string): Promise<OrderWithItems | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as OrderWithItems;
  } catch {
    return null;
  }
}

export type CreateOrderData = {
  customer_id?: string;
  customer_name: string;
  order_type?: "daily" | "event";
  daily_menu_id?: string;
  source: OrderSource;
  delivery_date: string;
  delivery_time?: string;
  delivery_notes?: string;
  items: {
    menu_item_id: string;
    item_name_es: string;
    price: number;
    quantity: number;
    special_instructions?: string;
  }[];
  discount?: number;
  payment_method?: string;
};

export async function createOrder(data: CreateOrderData) {
  const supabase = await createClient();

  // Calculate totals
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = data.discount ?? 0;
  const total = subtotal - discount;

  // Create order
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_id: data.customer_id || null,
      customer_name: data.customer_name,
      order_type: data.order_type ?? "daily",
      daily_menu_id: data.daily_menu_id || null,
      source: data.source,
      delivery_date: data.delivery_date,
      delivery_time: data.delivery_time || null,
      delivery_notes: data.delivery_notes || null,
      subtotal,
      discount,
      total,
      status: "pending",
      payment_status: "unpaid",
      payment_method: data.payment_method || null,
    })
    .select("id, order_number")
    .single();

  if (error) return { error: error.message };

  // Create order items
  if (data.items.length > 0 && order) {
    const itemRows = data.items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      item_name_es: item.item_name_es,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      special_instructions: item.special_instructions || null,
    }));

    const { error: itemError } = await supabase
      .from("order_items")
      .insert(itemRows);

    if (itemError) return { error: itemError.message };
  }

  // Update daily menu quantities if this is a daily order
  if (data.daily_menu_id) {
    for (const item of data.items) {
      try {
        await supabase
          .from("daily_menu_items")
          .update({
            quantity_ordered: item.quantity, // Will be incremented via SQL later
          })
          .eq("daily_menu_id", data.daily_menu_id)
          .eq("menu_item_id", item.menu_item_id);
      } catch {
        // Ignore errors - daily menu tracking is non-critical
      }
    }
  }

  revalidatePath("/pedidos");
  revalidatePath("/");
  revalidatePath("/menu-del-dia");
  return { success: true, id: order?.id, orderNumber: order?.order_number };
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/pedidos");
  revalidatePath("/");
  return { success: true };
}

export async function batchUpdateOrderStatus(ids: string[], status: OrderStatus) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .in("id", ids);

  if (error) return { error: error.message };

  revalidatePath("/pedidos");
  revalidatePath("/");
  return { success: true };
}

export async function updatePaymentStatus(
  id: string,
  paymentStatus: "unpaid" | "partial" | "paid",
  paymentMethod?: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: paymentStatus,
      payment_method: paymentMethod || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/pedidos");
  return { success: true };
}

export async function deleteOrder(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/pedidos");
  revalidatePath("/");
  return { success: true };
}

/**
 * Quick walk-up sale — minimal order, no customer needed
 */
export async function createWalkUpSale(data: {
  items: { menu_item_id: string; item_name_es: string; price: number; quantity: number }[];
  daily_menu_id?: string;
}) {
  return createOrder({
    customer_name: "Venta directa",
    source: "walk_in",
    delivery_date: new Date().toISOString().split("T")[0],
    daily_menu_id: data.daily_menu_id,
    items: data.items,
  });
}

/**
 * Get today's order stats for the dashboard
 */
export async function getTodaysStats() {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("orders")
      .select("id, status, total, source")
      .eq("delivery_date", today)
      .neq("status", "cancelled");

    if (error) throw error;

    const orders = data ?? [];
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const readyCount = orders.filter((o) => o.status === "ready").length;
    const deliveredCount = orders.filter((o) => o.status === "delivered").length;

    return {
      totalOrders,
      totalRevenue,
      readyCount,
      deliveredCount,
    };
  } catch {
    return { totalOrders: 0, totalRevenue: 0, readyCount: 0, deliveredCount: 0 };
  }
}
