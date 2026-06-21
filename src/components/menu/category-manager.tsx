"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Modal } from "@/components/shared/modal";
import { FormField, Input, Button } from "@/components/shared/form-field";
import { createCategory, deleteCategory } from "@/lib/actions/categories";
import { Trash2, Plus } from "lucide-react";
import type { Category } from "@/lib/supabase/types";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
};

export function CategoryManager({ open, onClose, categories }: Props) {
  const locale = useLocale();
  const t = useTranslations("menu");
  const tCommon = useTranslations("common");

  const [nameEs, setNameEs] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!nameEs.trim()) return;

    setSaving(true);
    const formData = new FormData();
    formData.set("name_es", nameEs.trim());
    formData.set("name_en", nameEn.trim());
    await createCategory(formData);
    setNameEs("");
    setNameEn("");
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await deleteCategory(id);
  }

  return (
    <Modal open={open} onClose={onClose} title={t("categories")}>
      <div className="space-y-4">
        {/* Existing categories */}
        <div className="space-y-2">
          {categories.map((cat) => {
            const name =
              locale === "en" && cat.name_en ? cat.name_en : cat.name_es;
            return (
              <div
                key={cat.id}
                className="flex items-center justify-between bg-[var(--muted)] rounded-xl px-4 py-3"
              >
                <span className="font-medium">{name}</span>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="touch-target p-2 rounded-lg hover:bg-[var(--border)] text-[var(--danger)]"
                  aria-label={tCommon("delete")}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
          {categories.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
              {tCommon("noResults")}
            </p>
          )}
        </div>

        {/* Add new category form */}
        <form onSubmit={handleAdd} className="space-y-3 pt-4 border-t border-[var(--border)]">
          <h3 className="font-semibold">{t("addCategory")}</h3>
          <FormField label={t("nameEs")} id="cat_name_es" required>
            <Input
              id="cat_name_es"
              value={nameEs}
              onChange={(e) => setNameEs(e.target.value)}
              placeholder="Antojitos"
              required
            />
          </FormField>
          <FormField label={t("nameEn")} id="cat_name_en">
            <Input
              id="cat_name_en"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Snacks"
            />
          </FormField>
          <Button
            type="submit"
            variant="primary"
            disabled={saving || !nameEs.trim()}
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            {saving ? tCommon("loading") : t("addCategory")}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
