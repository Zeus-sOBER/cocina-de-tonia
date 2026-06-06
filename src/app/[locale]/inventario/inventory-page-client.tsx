"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Modal } from "@/components/shared/modal";
import { FormField, Input, Select, Button } from "@/components/shared/form-field";
import { createIngredient, updateIngredient, type IngredientFormData } from "@/lib/actions/ingredients";
import { INGREDIENT_CATEGORIES, UNITS } from "@/lib/utils/constants";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Ingredient } from "@/lib/supabase/types";
import { Package, Plus, Search, AlertTriangle, Pencil } from "lucide-react";

type Props = { initialIngredients: Ingredient[] };

export function InventoryPageClient({ initialIngredients }: Props) {
  const locale = useLocale();
  const t = useTranslations("inventory");
  const tCommon = useTranslations("common");

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Ingredient | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Form state
  const [nameEs, setNameEs] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [unit, setUnit] = useState("piece");
  const [category, setCategory] = useState("other");
  const [currentStock, setCurrentStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = initialIngredients.filter((ing) => {
    if (filterCategory && ing.category !== filterCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return ing.name_es.toLowerCase().includes(q) || ing.name_en?.toLowerCase().includes(q);
    }
    return true;
  });

  const lowStockCount = initialIngredients.filter(
    (i) => i.min_stock > 0 && i.current_stock <= i.min_stock
  ).length;

  function openCreate() {
    setEditItem(null);
    setNameEs(""); setNameEn(""); setUnit("piece"); setCategory("other");
    setCurrentStock(""); setMinStock(""); setCostPerUnit("");
    setShowForm(true);
  }

  function openEdit(ing: Ingredient) {
    setEditItem(ing);
    setNameEs(ing.name_es); setNameEn(ing.name_en ?? "");
    setUnit(ing.unit); setCategory(ing.category ?? "other");
    setCurrentStock(ing.current_stock.toString()); setMinStock(ing.min_stock.toString());
    setCostPerUnit(ing.cost_per_unit?.toString() ?? "");
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!nameEs.trim()) return;
    setSaving(true);

    const data: IngredientFormData = {
      name_es: nameEs.trim(),
      name_en: nameEn.trim() || undefined,
      unit,
      category,
      current_stock: currentStock ? parseFloat(currentStock) : 0,
      min_stock: minStock ? parseFloat(minStock) : 0,
      cost_per_unit: costPerUnit ? parseFloat(costPerUnit) : undefined,
    };

    if (editItem) {
      await updateIngredient(editItem.id, data);
    } else {
      await createIngredient(data);
    }

    setSaving(false);
    setShowForm(false);
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Add button */}
      <Button variant="primary" onClick={openCreate} className="w-full flex items-center justify-center gap-2">
        <Plus size={20} /> {t("addIngredient")}
      </Button>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <AlertTriangle size={18} className="text-amber-600" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
            {lowStockCount} ingrediente{lowStockCount > 1 ? "s" : ""} con stock bajo
          </span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={`${tCommon("search")}...`}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder:text-[var(--muted-foreground)] touch-target"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        <button onClick={() => setFilterCategory(null)}
          className={cn("px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap touch-target",
            !filterCategory ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
          )}>
          Todos
        </button>
        {INGREDIENT_CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
            className={cn("px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap touch-target",
              filterCategory === cat ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            )}>
            {t(`categories.${cat}` as "categories.produce")}
          </button>
        ))}
      </div>

      {/* Ingredient list */}
      <div className="space-y-2">
        {filtered.map((ing) => {
          const isLow = ing.min_stock > 0 && ing.current_stock <= ing.min_stock;
          const name = locale === "en" && ing.name_en ? ing.name_en : ing.name_es;

          return (
            <div key={ing.id} className={cn(
              "bg-[var(--card)] rounded-xl border p-3 flex items-center gap-3",
              isLow ? "border-amber-300 dark:border-amber-700" : "border-[var(--border)]"
            )}>
              {isLow && <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn("text-lg font-bold", isLow ? "text-amber-600" : "text-[var(--foreground)]")}>
                    {ing.current_stock}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">{ing.unit}</span>
                  {ing.cost_per_unit !== null && ing.cost_per_unit > 0 && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      · {formatCurrency(ing.cost_per_unit)}/{ing.unit}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => openEdit(ing)} className="touch-target p-2 rounded-xl hover:bg-[var(--muted)]">
                <Pencil size={18} className="text-[var(--muted-foreground)]" />
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Package size={48} className="text-[var(--muted-foreground)] mb-3" />
          <p className="text-[var(--muted-foreground)]">{search || filterCategory ? tCommon("noResults") : t("title")}</p>
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editItem ? t("editIngredient") : t("addIngredient")}>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label={`${tCommon("name")} (ES)`} id="ing_name_es" required>
            <Input id="ing_name_es" value={nameEs} onChange={(e) => setNameEs(e.target.value)} placeholder="Jitomate" required />
          </FormField>
          <FormField label={`${tCommon("name")} (EN)`} id="ing_name_en">
            <Input id="ing_name_en" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Tomato" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label={t("unit")} id="ing_unit">
              <Select id="ing_unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                {UNITS.map((u) => (<option key={u} value={u}>{t(`units.${u}` as "units.kg")}</option>))}
              </Select>
            </FormField>
            <FormField label="Categoria" id="ing_cat">
              <Select id="ing_cat" value={category} onChange={(e) => setCategory(e.target.value)}>
                {INGREDIENT_CATEGORIES.map((c) => (<option key={c} value={c}>{t(`categories.${c}` as "categories.produce")}</option>))}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label={t("currentStock")} id="ing_stock">
              <Input id="ing_stock" type="number" inputMode="decimal" min="0" step="0.1" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} />
            </FormField>
            <FormField label={t("minStock")} id="ing_min">
              <Input id="ing_min" type="number" inputMode="decimal" min="0" step="0.1" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
            </FormField>
            <FormField label={t("costPerUnit")} id="ing_cost">
              <Input id="ing_cost" type="number" inputMode="decimal" min="0" step="0.01" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} placeholder="$" />
            </FormField>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">{tCommon("cancel")}</Button>
            <Button type="submit" variant="primary" disabled={saving || !nameEs.trim()} className="flex-1">
              {saving ? tCommon("loading") : tCommon("save")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
