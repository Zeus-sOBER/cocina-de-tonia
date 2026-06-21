"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { DailyMenu, DailyMenuItem, MenuItem } from "@/lib/supabase/types";

export type DailyMenuWithItems = DailyMenu & {
  daily_menu_items: (DailyMenuItem & {
    menu_item: MenuItem;
  })[];
};

export async function getTodaysMenu(): Promise<DailyMenuWithItems | null> {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_menus")
      .select(`
        *,
        daily_menu_items(
          *,
          menu_item:menu_items(*)
        )
      `)
      .eq("date", today)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // no rows
      throw error;
    }
    return data as DailyMenuWithItems;
  } catch {
    return null;
  }
}

export async function getDailyMenu(date: string): Promise<DailyMenuWithItems | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("daily_menus")
      .select(`
        *,
        daily_menu_items(
          *,
          menu_item:menu_items(*)
        )
      `)
      .eq("date", date)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as DailyMenuWithItems;
  } catch {
    return null;
  }
}

export type CreateDailyMenuData = {
  date: string;
  items: { menu_item_id: string; quantity_available: number }[];
  notes?: string;
};

export async function createDailyMenu(data: CreateDailyMenuData) {
  const supabase = await createClient();

  // Create the daily menu
  const { data: menu, error } = await supabase
    .from("daily_menus")
    .insert({
      date: data.date,
      notes: data.notes || null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Add items
  if (data.items.length > 0 && menu) {
    const itemRows = data.items.map((item) => ({
      daily_menu_id: menu.id,
      menu_item_id: item.menu_item_id,
      quantity_available: item.quantity_available,
      quantity_ordered: 0,
    }));

    const { error: itemError } = await supabase
      .from("daily_menu_items")
      .insert(itemRows);

    if (itemError) return { error: itemError.message };
  }

  revalidatePath("/menu-del-dia");
  revalidatePath("/");
  return { success: true, id: menu?.id };
}

export async function updateDailyMenuStatus(id: string, status: "draft" | "announced" | "closed") {
  const supabase = await createClient();

  const { error } = await supabase
    .from("daily_menus")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/menu-del-dia");
  revalidatePath("/");
  return { success: true };
}

export async function updateDailyMenuItemQuantity(
  dailyMenuItemId: string,
  quantityAvailable: number
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("daily_menu_items")
    .update({ quantity_available: quantityAvailable })
    .eq("id", dailyMenuItemId);

  if (error) return { error: error.message };

  revalidatePath("/menu-del-dia");
  return { success: true };
}

// generateShareMessage moved to @/lib/utils/share-message.ts (can't be in "use server" file)
