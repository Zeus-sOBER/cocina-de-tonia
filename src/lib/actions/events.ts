"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Event } from "@/lib/supabase/types";

export type EventWithClient = Event & {
  customer?: { id: string; name: string; phone: string | null } | null;
};

export async function getEvents(): Promise<EventWithClient[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*, customer:customers(id, name, phone)")
      .order("event_date", { ascending: false });

    if (error) throw error;
    return (data as EventWithClient[]) ?? [];
  } catch {
    return [];
  }
}

export type CreateEventData = {
  client_id?: string;
  event_date: string;
  guest_count?: number;
  venue?: string;
  notes?: string;
  total_quote?: number;
  deposit_amount?: number;
};

export async function createEvent(data: CreateEventData) {
  const supabase = await createClient();

  const { error } = await supabase.from("events").insert({
    client_id: data.client_id || null,
    event_date: data.event_date,
    guest_count: data.guest_count || null,
    venue: data.venue || null,
    notes: data.notes || null,
    total_quote: data.total_quote ?? 0,
    deposit_amount: data.deposit_amount ?? 0,
    status: "inquiry",
  });

  if (error) return { error: error.message };
  revalidatePath("/eventos");
  return { success: true };
}

export async function updateEventStatus(id: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/eventos");
  return { success: true };
}

export async function updateEventDeposit(id: string, depositPaid: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({ deposit_paid: depositPaid })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/eventos");
  return { success: true };
}
