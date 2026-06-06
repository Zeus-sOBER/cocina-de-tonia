"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FormField, Input, Select, Button } from "@/components/shared/form-field";
import { formatCurrency } from "@/lib/utils/format";
import type { ReceiptData } from "@/lib/ai/types";
import type { Ingredient } from "@/lib/supabase/types";
import type { ConfirmReceiptData, ConfirmReceiptItem } from "@/lib/actions/receipt-scanner";
import { INGREDIENT_CATEGORIES, UNITS } from "@/lib/utils/constants";
import { X, Plus, Check } from "lucide-react";

type ReviewRow = {
  originalName: string;
  ingredientId: string;
  nameEs: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  category: string;
  isNew: boolean;
  excluded: boolean;
};

type Props = {
  data: ReceiptData;
  ingredients: Ingredient[];
  onConfirm: (data: ConfirmReceiptData) => void;
  onCancel: () => void;
};

function fuzzyMatch(receiptName: string, ingredients: Ingredient[]): Ingredient | null {
  const normalized = receiptName.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  let bestMatch: Ingredient | null = null;
  let bestScore = 0;

  for (const ing of ingredients) {
    const ingName = ing.name_es.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    // Check if one contains the other
    if (normalized.includes(ingName) || ingName.includes(normalized)) {
      const score = Math.min(normalized.length, ingName.length) / Math.max(normalized.length, ingName.length);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = ing;
      }
    }
    // Check word overlap
    const receiptWords = normalized.split(/\s+/);
    const ingWords = ingName.split(/\s+/);
    const overlap = receiptWords.filter((w) => ingWords.some((iw) => iw.includes(w) || w.includes(iw))).length;
    const wordScore = overlap / Math.max(receiptWords.length, ingWords.length);
    if (wordScore > 0.5 && wordScore > bestScore) {
      bestScore = wordScore;
      bestMatch = ing;
    }
  }

  return bestScore > 0.3 ? bestMatch : null;
}

export function ReceiptReview({ data, ingredients, onConfirm, onCancel }: Props) {
  const t = useTranslations("receipt");
  const tCommon = useTranslations("common");

  // Initialize rows from receipt data with fuzzy matching
  const [rows, setRows] = useState<ReviewRow[]>(() =>
    data.items.map((item) => {
      const match = fuzzyMatch(item.name, ingredients);
      const unitPrice = item.unit_price ?? (item.total && item.quantity ? item.total / item.quantity : 0);
      return {
        originalName: item.name,
        ingredientId: match?.id ?? "",
        nameEs: match?.name_es ?? item.name,
        quantity: item.quantity,
        unit: match?.unit ?? "piece",
        costPerUnit: unitPrice,
        totalCost: item.total ?? unitPrice * item.quantity,
        category: match?.category ?? "other",
        isNew: !match,
        excluded: false,
      };
    })
  );

  const [storeName, setStoreName] = useState(data.store_name ?? "");
  const [receiptDate, setReceiptDate] = useState(data.date ?? "");

  const activeRows = rows.filter((r) => !r.excluded);
  const yourTotal = activeRows.reduce((sum, r) => sum + r.totalCost, 0);

  function updateRow(index: number, updates: Partial<ReviewRow>) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...updates } : row))
    );
  }

  function selectIngredient(index: number, ingredientId: string) {
    const ing = ingredients.find((i) => i.id === ingredientId);
    if (ing) {
      updateRow(index, {
        ingredientId: ing.id,
        nameEs: ing.name_es,
        unit: ing.unit,
        category: ing.category ?? "other",
        isNew: false,
      });
    } else {
      updateRow(index, { ingredientId: "", isNew: true });
    }
  }

  function handleConfirm() {
    const items: ConfirmReceiptItem[] = activeRows.map((row) => ({
      ingredient_id: row.isNew ? null : row.ingredientId || null,
      name_es: row.nameEs,
      quantity: row.quantity,
      unit: row.unit,
      cost_per_unit: row.costPerUnit,
      total_cost: row.totalCost,
      category: row.category,
      is_new: row.isNew || !row.ingredientId,
    }));

    onConfirm({
      items,
      store_name: storeName || undefined,
      receipt_date: receiptDate || undefined,
    });
  }

  return (
    <div className="space-y-4">
      {/* Store info */}
      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("storeName")} id="store">
          <Input id="store" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </FormField>
        <FormField label={t("receiptDate")} id="date">
          <Input id="date" type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} />
        </FormField>
      </div>

      {/* Totals comparison */}
      <div className="flex justify-between bg-[var(--card)] rounded-xl p-3 border border-[var(--border)]">
        <div>
          <p className="text-xs text-[var(--muted-foreground)]">{t("receiptTotal")}</p>
          <p className="text-lg font-bold">{data.receipt_total ? formatCurrency(data.receipt_total) : "—"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--muted-foreground)]">{t("yourTotal")}</p>
          <p className="text-lg font-bold text-[var(--primary)]">{formatCurrency(yourTotal)}</p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className={`bg-[var(--card)] rounded-xl border border-[var(--border)] p-3 space-y-2 ${
              row.excluded ? "opacity-40" : ""
            }`}
          >
            {/* Header: original name + exclude button */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--muted-foreground)] truncate flex-1">
                {row.originalName}
              </p>
              <button
                onClick={() => updateRow(index, { excluded: !row.excluded })}
                className="p-1 rounded-lg hover:bg-[var(--muted)]"
              >
                {row.excluded ? <Plus size={16} /> : <X size={16} className="text-[var(--danger)]" />}
              </button>
            </div>

            {!row.excluded && (
              <>
                {/* Ingredient match */}
                <Select
                  value={row.ingredientId}
                  onChange={(e) => selectIngredient(index, e.target.value)}
                  className="!py-2 text-sm"
                >
                  <option value="">{row.isNew ? `+ ${t("createNew")}: ${row.nameEs}` : t("matchIngredient")}</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name_es} ({ing.unit})
                    </option>
                  ))}
                </Select>

                {/* New ingredient fields */}
                {row.isNew && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={row.nameEs}
                      onChange={(e) => updateRow(index, { nameEs: e.target.value })}
                      placeholder="Nombre"
                      className="!py-2 text-sm"
                    />
                    <Select
                      value={row.category}
                      onChange={(e) => updateRow(index, { category: e.target.value })}
                      className="!py-2 text-sm"
                    >
                      {INGREDIENT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Select>
                  </div>
                )}

                {/* Quantity, unit, cost */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-1">{tCommon("quantity")}</p>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min="0.01"
                      step="0.01"
                      value={row.quantity}
                      onChange={(e) => {
                        const qty = parseFloat(e.target.value) || 0;
                        updateRow(index, { quantity: qty, totalCost: qty * row.costPerUnit });
                      }}
                      className="!py-2 text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-1">Unit</p>
                    <Select
                      value={row.unit}
                      onChange={(e) => updateRow(index, { unit: e.target.value })}
                      className="!py-2 text-sm"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-1">{tCommon("price")}</p>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={row.costPerUnit}
                      onChange={(e) => {
                        const cost = parseFloat(e.target.value) || 0;
                        updateRow(index, { costPerUnit: cost, totalCost: row.quantity * cost });
                      }}
                      className="!py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Line total */}
                <p className="text-right text-sm font-bold text-[var(--primary)]">
                  {formatCurrency(row.totalCost)}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 sticky bottom-0 bg-[var(--background)] pb-safe">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          {tCommon("cancel")}
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={activeRows.length === 0}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Check size={18} />
          {t("confirm")} ({activeRows.length})
        </Button>
      </div>
    </div>
  );
}
