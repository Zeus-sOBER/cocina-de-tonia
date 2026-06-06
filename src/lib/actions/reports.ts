"use server";

import { createClient } from "@/lib/supabase/server";

export async function getWeeklyReport() {
  try {
    const supabase = await createClient();
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, total, status, source, delivery_date, order_items(item_name_es, quantity, subtotal)")
      .gte("delivery_date", weekAgo.toISOString().split("T")[0])
      .neq("status", "cancelled");

    if (error) throw error;

    const allOrders = orders ?? [];

    // Daily breakdown
    const dailyMap: Record<string, { orders: number; revenue: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = { orders: 0, revenue: 0 };
    }

    // Source breakdown
    const sourceMap: Record<string, number> = {};

    // Item popularity
    const itemMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

    for (const order of allOrders) {
      const date = order.delivery_date;
      if (dailyMap[date]) {
        dailyMap[date].orders++;
        dailyMap[date].revenue += order.total || 0;
      }

      const src = order.source || "phone";
      sourceMap[src] = (sourceMap[src] || 0) + (order.total || 0);

      for (const item of order.order_items ?? []) {
        if (!itemMap[item.item_name_es]) {
          itemMap[item.item_name_es] = { name: item.item_name_es, quantity: 0, revenue: 0 };
        }
        itemMap[item.item_name_es].quantity += item.quantity;
        itemMap[item.item_name_es].revenue += item.subtotal;
      }
    }

    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = allOrders.length;

    const dailyBreakdown = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));

    const popularItems = Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const revenueBySource = Object.entries(sourceMap)
      .sort(([, a], [, b]) => b - a)
      .map(([source, revenue]) => ({ source, revenue }));

    return {
      totalOrders,
      totalRevenue,
      dailyBreakdown,
      popularItems,
      revenueBySource,
    };
  } catch {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      dailyBreakdown: [],
      popularItems: [],
      revenueBySource: [],
    };
  }
}
