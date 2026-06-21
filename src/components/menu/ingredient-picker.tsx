"use client";

import { useLocale, useTranslations } from "next-intl";
import { Plus, Minus, X } from "lucide-react";
import { Input } from "@/components/shared/form-field";
import type { Ingredient } from "@/lib/supabase/types";

type RecipeIngredient = { ingredient_id: string; quantity: number };

type Props = {
  ingredients: Ingredient[];
  selected: RecipeIngredient[];
  onChange: (items: RecipeIngredient[]) => void;
};

export function IngredientPicker({ ingredients, selected, onChange }: Props) {
  const locale = useLocale();
  const t = useTranslations("menu");

  function addIngredient(ingredientId: string) {
    if (selected.find((s) => s.ingredient_id === ingredientId)) return;
    onChange([...selected, { ingredient_id: ingredientId, quantity: 1 }]);
  }

  function removeIngredient(ingredientId: string) {
    onChange(selected.filter((s) => s.ingredient_id !== ingredientId));
  }

  function updateQuantity(ingredientId: string, quantity: number) {
    if (quantity <= 0) return removeIngredient(ingredientId);
    onChange(
      selected.map((s) =>
        s.ingredient_id === ingredientId ? { ...s, quantity } : s
      )
    );
  }

  const availableIngredients = ingredients.filter(
    (ing) => !selected.find((s) => s.ingredient_id === ing.id)
  );

  return (
    <div className="space-y-3">
      {/* Selected ingredients */}
      {selected.map((sel) => {
        const ingredient = ingredients.find((i) => i.id === sel.ingredient_id);
        if (!ingredient) return null;
        const name =
          locale === "en" && ingredient.name_en
            ? ingredient.name_en
            : ingredient.name_es;

        return (
          <div
            key={sel.ingredient_id}
            className="flex items-center gap-3 bg-[var(--muted)] rounded-xl px-3 py-2"
          >
            <button
              type="button"
              onClick={() => removeIngredient(sel.ingredient_id)}
              className="p-1 rounded-full hover:bg-[var(--border)] text-[var(--danger)]"
            >
              <X size={16} />
            </button>
            <span className="flex-1 text-sm font-medium truncate">{name}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => updateQuantity(sel.ingredient_id, sel.quantity - 0.5)}
                className="touch-target w-8 h-8 rounded-lg bg-[var(--card)] flex items-center justify-center"
              >
                <Minus size={14} />
              </button>
              <Input
                type="number"
                inputMode="decimal"
                min="0.1"
                step="0.1"
                value={sel.quantity}
                onChange={(e) =>
                  updateQuantity(sel.ingredient_id, parseFloat(e.target.value) || 0)
                }
                className="w-16 text-center px-1 py-1 text-sm !min-h-0"
              />
              <button
                type="button"
                onClick={() => updateQuantity(sel.ingredient_id, sel.quantity + 0.5)}
                className="touch-target w-8 h-8 rounded-lg bg-[var(--card)] flex items-center justify-center"
              >
                <Plus size={14} />
              </button>
              <span className="text-xs text-[var(--muted-foreground)] w-8">
                {ingredient.unit}
              </span>
            </div>
          </div>
        );
      })}

      {/* Add ingredient dropdown */}
      {availableIngredients.length > 0 && (
        <select
          className="w-full px-4 py-3 rounded-xl border border-dashed border-[var(--border)]
                     bg-transparent text-[var(--muted-foreground)] text-sm
                     focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
                     touch-target"
          value=""
          onChange={(e) => {
            if (e.target.value) addIngredient(e.target.value);
          }}
        >
          <option value="">+ {t("addIngredient")}...</option>
          {availableIngredients.map((ing) => (
            <option key={ing.id} value={ing.id}>
              {locale === "en" && ing.name_en ? ing.name_en : ing.name_es} ({ing.unit})
            </option>
          ))}
        </select>
      )}

      {ingredients.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)] italic">
          No ingredients available. Add them in Inventory first.
        </p>
      )}
    </div>
  );
}
