"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/shared/modal";
import { FormField, Input, Select, Button } from "@/components/shared/form-field";
import { createEvent, updateEventStatus, updateEventDeposit, type EventWithClient } from "@/lib/actions/events";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { EVENT_STATUSES, type EventStatus } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";
import type { Customer } from "@/lib/supabase/types";
import { CalendarHeart, Plus, Users, MapPin, DollarSign, Check } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  inquiry: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  quoted: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

type Props = { initialEvents: EventWithClient[]; customers: Customer[] };

export function EventsPageClient({ initialEvents, customers }: Props) {
  const t = useTranslations("events");
  const tCommon = useTranslations("common");

  const [showForm, setShowForm] = useState(false);
  const [clientId, setClientId] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [venue, setVenue] = useState("");
  const [notes, setNotes] = useState("");
  const [totalQuote, setTotalQuote] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!eventDate) return;
    setSaving(true);
    await createEvent({
      client_id: clientId || undefined,
      event_date: eventDate,
      guest_count: guestCount ? parseInt(guestCount) : undefined,
      venue: venue.trim() || undefined,
      notes: notes.trim() || undefined,
      total_quote: totalQuote ? parseFloat(totalQuote) : undefined,
      deposit_amount: depositAmount ? parseFloat(depositAmount) : undefined,
    });
    setSaving(false);
    setShowForm(false);
    setClientId(""); setEventDate(""); setGuestCount(""); setVenue("");
    setNotes(""); setTotalQuote(""); setDepositAmount("");
  }

  async function handleStatusChange(eventId: string, newStatus: string) {
    await updateEventStatus(eventId, newStatus);
  }

  async function handleDepositToggle(eventId: string, current: boolean) {
    await updateEventDeposit(eventId, !current);
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <Button variant="primary" onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2">
        <Plus size={20} /> {t("newEvent")}
      </Button>

      {/* Events list */}
      <div className="space-y-3">
        {initialEvents.map((event) => (
          <div key={event.id} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-base">{event.customer?.name || "Cliente"}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {formatDate(event.event_date)}
                </p>
              </div>
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", STATUS_COLORS[event.status])}>
                {t(`status.${event.status}` as "status.inquiry")}
              </span>
            </div>

            {/* Details */}
            <div className="flex gap-4 text-sm text-[var(--muted-foreground)]">
              {event.guest_count && (
                <span className="flex items-center gap-1"><Users size={14} /> {event.guest_count}</span>
              )}
              {event.venue && (
                <span className="flex items-center gap-1"><MapPin size={14} /> {event.venue}</span>
              )}
            </div>

            {/* Quote + Deposit */}
            {event.total_quote > 0 && (
              <div className="flex items-center justify-between bg-[var(--muted)] rounded-xl px-3 py-2">
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Total</p>
                  <p className="font-bold text-[var(--primary)]">{formatCurrency(event.total_quote)}</p>
                </div>
                {event.deposit_amount > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-[var(--muted-foreground)]">{t("deposit")}</p>
                    <button
                      onClick={() => handleDepositToggle(event.id, event.deposit_paid)}
                      className={cn("font-bold flex items-center gap-1",
                        event.deposit_paid ? "text-[var(--success)]" : "text-[var(--danger)]"
                      )}
                    >
                      {event.deposit_paid && <Check size={14} />}
                      {formatCurrency(event.deposit_amount)}
                    </button>
                  </div>
                )}
              </div>
            )}

            {event.notes && <p className="text-xs text-[var(--muted-foreground)] italic">{event.notes}</p>}

            {/* Status buttons */}
            {event.status !== "completed" && event.status !== "cancelled" && (
              <div className="flex gap-2 pt-1">
                {EVENT_STATUSES.filter((s) => {
                  const flow: Record<string, string[]> = {
                    inquiry: ["quoted", "cancelled"],
                    quoted: ["confirmed", "cancelled"],
                    confirmed: ["completed", "cancelled"],
                  };
                  return flow[event.status]?.includes(s);
                }).map((nextStatus) => (
                  <button
                    key={nextStatus}
                    onClick={() => handleStatusChange(event.id, nextStatus)}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-sm font-semibold touch-target",
                      nextStatus === "cancelled"
                        ? "bg-red-50 text-red-600 dark:bg-red-900/20"
                        : "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    )}
                  >
                    {t(`status.${nextStatus}` as "status.inquiry")}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {initialEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <CalendarHeart size={48} className="text-[var(--muted-foreground)] mb-3" />
          <p className="text-[var(--muted-foreground)]">{t("noEvents")}</p>
        </div>
      )}

      {/* Create event modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={t("newEvent")}>
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Cliente" id="ev_client">
            <Select id="ev_client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">— Seleccionar —</option>
              {customers.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </Select>
          </FormField>
          <FormField label={t("eventDate")} id="ev_date" required>
            <Input id="ev_date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label={t("guestCount")} id="ev_guests">
              <Input id="ev_guests" type="number" inputMode="numeric" min="1" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} placeholder="50" />
            </FormField>
            <FormField label={t("venue")} id="ev_venue">
              <Input id="ev_venue" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Salon..." />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Total" id="ev_quote">
              <Input id="ev_quote" type="number" inputMode="decimal" min="0" step="0.01" value={totalQuote} onChange={(e) => setTotalQuote(e.target.value)} placeholder="$0.00" />
            </FormField>
            <FormField label={t("deposit")} id="ev_deposit">
              <Input id="ev_deposit" type="number" inputMode="decimal" min="0" step="0.01" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="$0.00" />
            </FormField>
          </div>
          <FormField label={tCommon("notes")} id="ev_notes">
            <Input id="ev_notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas del evento..." />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">{tCommon("cancel")}</Button>
            <Button type="submit" variant="primary" disabled={saving || !eventDate} className="flex-1">
              {saving ? tCommon("loading") : tCommon("save")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
