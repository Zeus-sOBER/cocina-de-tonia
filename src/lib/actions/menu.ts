"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MenuItem, MenuItemIngredient } from "@/lib/supabase/types";

export type MenuItemWithCategory = MenuItem & {
  category?: { id: string; name_es: string; name_en: string | null } | null;
};

export type MenuItemWithIngredients = MenuItem & {
  menu_item_ingredients?: (MenuItemIngredient & {
    ingredient?: { id: string; name_es: string; name_en: string | null; unit: string } | null;
  })[];
};

export async function getMenuItems(categoryId?: string): Promise<MenuItemWithCategory[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("menu_items")
      .select("*, category:categories(id, name_es, name_en)")
      .order("sort_order", { ascending: true });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as MenuItemWithCategory[]) ?? [];
  } catch {
    return [];
  }
}

export async function getMenuItem(id: string): Promise<MenuItemWithIngredients | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("menu_items")
      .select(`
        *,
        menu_item_ingredients(
          id, menu_item_id, ingredient_id, quantity,
          ingredient:ingredients(id, name_es, name_en, unit)
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as MenuItemWithIngredients;
  } catch {
    return null;
  }
}

export type MenuItemFormData = {
  name_es: string;
  name_en?: string;
  description_es?: string;
  description_en?: string;
  price: number;
  cost_estimate?: number;
  category_id?: string;
  is_available?: boolean;
  ingredients?: { ingredient_id: string; quantity: number }[];
};

export async function createMenuItem(data: MenuItemFormData) {
  const supabase = await createClient();

  const { ingredients, ...itemData } = data;

  const { data: newItem, error } = await supabase
    .from("menu_items")
    .insert({
      name_es: itemData.name_es,
      name_en: itemData.name_en || null,
      description_es: itemData.description_es || null,
      description_en: itemData.description_en || null,
      price: itemData.price,
      cost_estimate: itemData.cost_estimate || null,
      category_id: itemData.category_id || null,
      is_available: itemData.is_available ?? true,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Add ingredients if provided
  if (ingredients && ingredients.length > 0 && newItem) {
    const ingredientRows = ingredients.map((ing) => ({
      menu_item_id: newItem.id,
      ingredient_id: ing.ingredient_id,
      quantity: ing.quantity,
    }));

    const { error: ingError } = await supabase
      .from("menu_item_ingredients")
      .insert(ingredientRows);

    if (ingError) return { error: ingError.message };
  }

  revalidatePath("/menu");
  return { success: true, id: newItem?.id };
}

export async function updateMenuItem(id: string, data: MenuItemFormData) {
  const supabase = await createClient();

  const { ingredients, ...itemData } = data;

  const { error } = await supabase
    .from("menu_items")
    .update({
      name_es: itemData.name_es,
      name_en: itemData.name_en || null,
      description_es: itemData.description_es || null,
      description_en: itemData.description_en || null,
      price: itemData.price,
      cost_estimate: itemData.cost_estimate || null,
      category_id: itemData.category_id || null,
      is_available: itemData.is_available,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  // Replace ingredients
  if (ingredients !== undefined) {
    // Delete existing
    await supabase
      .from("menu_item_ingredients")
      .delete()
      .eq("menu_item_id", id);

    // Insert new
    if (ingredients.length > 0) {
      const ingredientRows = ingredients.map((ing) => ({
        menu_item_id: id,
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity,
      }));

      const { error: ingError } = await supabase
        .from("menu_item_ingredients")
        .insert(ingredientRows);

      if (ingError) return { error: ingError.message };
    }
  }

  revalidatePath("/menu");
  return { success: true };
}

export async function toggleAvailability(id: string, isAvailable: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/menu");
  return { success: true };
}

export async function deleteMenuItem(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/menu");
  return { success: true };
}
