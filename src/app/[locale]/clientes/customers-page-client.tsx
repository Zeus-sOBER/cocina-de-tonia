"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/shared/modal";
import { FormField, Input, Select, Button } from "@/components/shared/form-field";
import { createCustomer } from "@/lib/actions/customers";
import { formatCurrency } from "@/lib/utils/format";
import type { Customer } from "@/lib/supabase/types";
import { Users, Plus, Search, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ORDER_SOURCES } from "@/lib/utils/constants";

type Props = { initialCustomers: Customer[] };

export function CustomersPageClient({ initialCustomers }: Props) {
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");
  const tOrders = useTranslations("orders");

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("phone");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = search.trim()
    ? initialCustomers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone?.includes(search)
      )
    : initialCustomers;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await createCustomer({ name: name.trim(), phone: phone.trim() || undefined, source, notes: notes.trim() || undefined });
    setSaving(false);
    setShowForm(false);
    setName(""); setPhone(""); setSource("phone"); setNotes("");
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Add button */}
      <Button variant="primary" onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2">
        <Plus size={20} />
        {t("addCustomer")}
      </Button>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${tCommon("search")}...`}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder:text-[var(--muted-foreground)] touch-target"
        />
      </div>

      {/* Customer list */}
      <div className="space-y-3">
        {filtered.map((customer) => (
          <div key={customer.id} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center">
                  <User size={20} className="text-[var(--muted-foreground)]" />
                </div>
                <div>
                  <h3 className="font-semibold">{customer.name}</h3>
                  {customer.phone && (
                    <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1">
                      <Phone size={12} /> {customer.phone}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
                {tOrders(`sources.${customer.source}` as "sources.phone")}
              </span>
            </div>
            {(customer.total_orders > 0 || customer.total_spent > 0) && (
              <div className="flex gap-4 mt-3 pt-3 border-t border-[var(--border)]">
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">{t("totalOrders")}</p>
                  <p className="font-bold">{customer.total_orders}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">{t("totalSpent")}</p>
                  <p className="font-bold text-[var(--primary)]">{formatCurrency(customer.total_spent)}</p>
                </div>
              </div>
            )}
            {customer.notes && (
              <p className="text-xs text-[var(--muted-foreground)] mt-2 italic">{customer.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Users size={48} className="text-[var(--muted-foreground)] mb-3" />
          <p className="text-[var(--muted-foreground)]">
            {search ? tCommon("noResults") : t("noCustomers")}
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-center text-sm text-[var(--muted-foreground)]">
          {filtered.length} {filtered.length === 1 ? "cliente" : "clientes"}
        </p>
      )}

      {/* Add customer modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={t("addCustomer")}>
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label={tCommon("name")} id="cust_name" required>
            <Input id="cust_name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Maria Lopez" required />
          </FormField>
          <FormField label={tCommon("phone")} id="cust_phone">
            <Input id="cust_phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(956) 555-1234" />
          </FormField>
          <FormField label={tOrders("source")} id="cust_source">
            <Select id="cust_source" value={source} onChange={(e) => setSource(e.target.value)}>
              {ORDER_SOURCES.map((s) => (
                <option key={s} value={s}>{tOrders(`sources.${s}` as "sources.phone")}</option>
              ))}
            </Select>
          </FormField>
          <FormField label={tCommon("notes")} id="cust_notes">
            <Input id="cust_notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas..." />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">{tCommon("cancel")}</Button>
            <Button type="submit" variant="primary" disabled={saving || !name.trim()} className="flex-1">
              {saving ? tCommon("loading") : tCommon("save")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
