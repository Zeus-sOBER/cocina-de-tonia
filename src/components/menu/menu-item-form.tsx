"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Modal } from "@/components/shared/modal";
import { FormField, Input, Select, Textarea, Button } from "@/components/shared/form-field";
import { IngredientPicker } from "./ingredient-picker";
import { createMenuItem, updateMenuItem, type MenuItemFormData } from "@/lib/actions/menu";
import type { MenuItemWithCategory } from "@/lib/actions/menu";
import type { Category, Ingredient } from "@/lib/supabase/types";
import { Trash2 } from "lucide-react";
import { deleteMenuItem } from "@/lib/actions/menu";

type Props = {
  open: boolean;
  onClose: () => void;
  editItem?: MenuItemWithCategory | null;
  categories: Category[];
  ingredients: Ingredient[];
};

type RecipeIngredient = { ingredient_id: string; quantity: number };

export function MenuItemForm({ open, onClose, editItem, categories, ingredients }: Props) {
  const locale = useLocale();
  const t = useTranslations("menu");
  const tCommon = useTranslations("common");

  const [nameEs, setNameEs] = useState(editItem?.name_es ?? "");
  const [nameEn, setNameEn] = useState(editItem?.name_en ?? "");
  const [descEs, setDescEs] = useState(editItem?.description_es ?? "");
  const [descEn, setDescEn] = useState(editItem?.description_en ?? "");
  const [price, setPrice] = useState(editItem?.price?.toString() ?? "");
  const [costEstimate, setCostEstimate] = useState(editItem?.cost_estimate?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(editItem?.category_id ?? "");
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!editItem;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameEs.trim() || !price.trim()) return;

    setSaving(true);
    setError("");

    const data: MenuItemFormData = {
      name_es: nameEs.trim(),
      name_en: nameEn.trim() || undefined,
      description_es: descEs.trim() || undefined,
      description_en: descEn.trim() || undefined,
      price: parseFloat(price),
      cost_estimate: costEstimate ? parseFloat(costEstimate) : undefined,
      category_id: categoryId || undefined,
      ingredients: recipeIngredients.length > 0 ? recipeIngredients : undefined,
    };

    const result = isEditing
      ? await updateMenuItem(editItem.id, data)
      : await createMenuItem(data);

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onClose();
  }

  async function handleDelete() {
    if (!editItem) return;
    setSaving(true);
    await deleteMenuItem(editItem.id);
    setSaving(false);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? t("editItem") : t("addItem")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name (Spanish - required) */}
        <FormField label={t("nameEs")} id="name_es" required>
          <Input
            id="name_es"
            value={nameEs}
            onChange={(e) => setNameEs(e.target.value)}
            placeholder="Tacos de Birria"
            required
          />
        </FormField>

        {/* Name (English - optional) */}
        <FormField label={t("nameEn")} id="name_en">
          <Input
            id="name_en"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Birria Tacos"
          />
        </FormField>

        {/* Price + Cost side by side */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label={tCommon("price")} id="price" required>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.50"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </FormField>
          <FormField label={t("costEstimate")} id="cost_estimate">
            <Input
              id="cost_estimate"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.50"
              value={costEstimate}
              onChange={(e) => setCostEstimate(e.target.value)}
              placeholder="0.00"
            />
          </FormField>
        </div>

        {/* Category */}
        <FormField label={t("categories")} id="category_id">
          <Select
            id="category_id"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">— {t("categories")} —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {locale === "en" && cat.name_en ? cat.name_en : cat.name_es}
              </option>
            ))}
          </Select>
        </FormField>

        {/* Description (Spanish) */}
        <FormField label={`${t("description")} (ES)`} id="desc_es">
          <Textarea
            id="desc_es"
            value={descEs}
            onChange={(e) => setDescEs(e.target.value)}
            placeholder="Descripcion del platillo..."
          />
        </FormField>

        {/* Description (English) */}
        <FormField label={`${t("description")} (EN)`} id="desc_en">
          <Textarea
            id="desc_en"
            value={descEn}
            onChange={(e) => setDescEn(e.target.value)}
            placeholder="Dish description..."
          />
        </FormField>

        {/* Ingredients / Recipe */}
        <div>
          <h3 className="text-sm font-medium text-[var(--foreground)] mb-2">
            {t("ingredients")}
          </h3>
          <IngredientPicker
            ingredients={ingredients}
            selected={recipeIngredients}
            onChange={setRecipeIngredients}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-[var(--danger)] bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {isEditing && (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Trash2 size={18} />
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving || !nameEs.trim() || !price.trim()}
            className="flex-1"
          >
            {saving ? tCommon("loading") : tCommon("save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
