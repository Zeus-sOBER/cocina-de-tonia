"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Customer } from "@/lib/supabase/types";

export async function getCustomers(search?: string): Promise<Customer[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("customers")
      .select("*")
      .order("name", { ascending: true });

    if (search && search.trim()) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query.limit(50);
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getCustomer(id: string): Promise<Customer | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function createCustomer(data: {
  name: string;
  phone?: string;
  source?: string;
  notes?: string;
}) {
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      name: data.name,
      phone: data.phone || null,
      source: data.source || "phone",
      notes: data.notes || null,
    })
    .select("id, name")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/clientes");
  return { success: true, id: customer?.id, name: customer?.name };
}

export async function quickAddCustomer(name: string, phone?: string) {
  return createCustomer({ name, phone });
}
