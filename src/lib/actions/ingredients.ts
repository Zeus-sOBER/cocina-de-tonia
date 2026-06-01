"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Ingredient } from "@/lib/supabase/types";

export async function getIngredients(category?: string): Promise<Ingredient[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("ingredients")
      .select("*")
      .order("name_es", { ascending: true });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export type IngredientFormData = {
  name_es: string;
  name_en?: string;
  unit: string;
  category?: string;
  current_stock?: number;
  min_stock?: number;
  cost_per_unit?: number;
  supplier_note?: string;
};

export async function createIngredient(data: IngredientFormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("ingredients").insert({
    name_es: data.name_es,
    name_en: data.name_en || null,
    unit: data.unit,
    category: data.category || null,
    current_stock: data.current_stock ?? 0,
    min_stock: data.min_stock ?? 0,
    cost_per_unit: data.cost_per_unit || null,
    supplier_note: data.supplier_note || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/menu");
  revalidatePath("/inventario");
  return { success: true };
}

export async function updateIngredient(id: string, data: IngredientFormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("ingredients")
    .update({
      name_es: data.name_es,
      name_en: data.name_en || null,
      unit: data.unit,
      category: data.category || null,
      min_stock: data.min_stock ?? 0,
      cost_per_unit: data.cost_per_unit || null,
      supplier_note: data.supplier_note || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/menu");
  revalidatePath("/inventario");
  return { success: true };
}

export async function deleteIngredient(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("ingredients")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/inventario");
  return { success: true };
}
