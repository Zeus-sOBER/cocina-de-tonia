"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PrepTask } from "@/lib/supabase/types";

export async function getPrepTasks(date?: string): Promise<PrepTask[]> {
  try {
    const supabase = await createClient();
    const targetDate = date || new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("prep_tasks")
      .select("*")
      .eq("date", targetDate)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

/**
 * Generate prep tasks from confirmed orders for a given date.
 * Aggregates order items by menu item and creates/updates prep tasks.
 */
export async function generatePrepTasks(date?: string) {
  const supabase = await createClient();
  const targetDate = date || new Date().toISOString().split("T")[0];

  // Get all confirmed+ orders for the date
  const { data: orders, error: orderError } = await supabase
    .from("orders")
    .select("id, order_items(menu_item_id, item_name_es, quantity)")
    .eq("delivery_date", targetDate)
    .in("status", ["confirmed", "preparing", "ready"]);

  if (orderError) return { error: orderError.message };

  // Aggregate by menu item
  const aggregated: Record<string, { name: string; quantity: number; menuItemId: string | null }> = {};
  for (const order of orders ?? []) {
    for (const item of order.order_items ?? []) {
      const key = item.menu_item_id || item.item_name_es;
      if (!aggregated[key]) {
        aggregated[key] = { name: item.item_name_es, quantity: 0, menuItemId: item.menu_item_id };
      }
      aggregated[key].quantity += item.quantity;
    }
  }

  // Delete existing prep tasks for this date
  await supabase.from("prep_tasks").delete().eq("date", targetDate);

  // Create new prep tasks
  const tasks = Object.entries(aggregated).map(([, value], index) => ({
    date: targetDate,
    menu_item_id: value.menuItemId,
    item_name_es: value.name,
    total_quantity: value.quantity,
    completed_quantity: 0,
    is_completed: false,
    sort_order: index,
  }));

  if (tasks.length > 0) {
    const { error: insertError } = await supabase.from("prep_tasks").insert(tasks);
    if (insertError) return { error: insertError.message };
  }

  revalidatePath("/preparacion");
  revalidatePath("/");
  return { success: true, taskCount: tasks.length };
}

export async function togglePrepTask(taskId: string, isCompleted: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("prep_tasks")
    .update({
      is_completed: isCompleted,
      completed_quantity: isCompleted ? undefined : 0, // will be set to total if completed
      completed_at: isCompleted ? new Date().toISOString() : null,
      completed_by: isCompleted ? user?.id : null,
    })
    .eq("id", taskId);

  if (error) return { error: error.message };

  // If marking complete, set completed_quantity = total_quantity
  if (isCompleted) {
    const { data: task } = await supabase
      .from("prep_tasks")
      .select("total_quantity")
      .eq("id", taskId)
      .single();

    if (task) {
      await supabase
        .from("prep_tasks")
        .update({ completed_quantity: task.total_quantity })
        .eq("id", taskId);
    }
  }

  revalidatePath("/preparacion");
  return { success: true };
}
