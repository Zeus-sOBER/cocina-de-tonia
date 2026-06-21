"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Category } from "@/lib/supabase/types";

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const nameEs = formData.get("name_es") as string;
  const nameEn = (formData.get("name_en") as string) || null;

  const { error } = await supabase.from("categories").insert({
    name_es: nameEs,
    name_en: nameEn,
  });

  if (error) return { error: error.message };

  revalidatePath("/menu");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  const nameEs = formData.get("name_es") as string;
  const nameEn = (formData.get("name_en") as string) || null;

  const { error } = await supabase
    .from("categories")
    .update({ name_es: nameEs, name_en: nameEn })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/menu");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/menu");
  return { success: true };
}
