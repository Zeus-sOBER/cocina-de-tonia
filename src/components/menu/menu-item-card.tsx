"use client";

import { useLocale, useTranslations } from "next-intl";
import { toggleAvailability } from "@/lib/actions/menu";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Pencil, Eye, EyeOff } from "lucide-react";
import type { MenuItemWithCategory } from "@/lib/actions/menu";

type Props = {
  item: MenuItemWithCategory;
  onEdit: (item: MenuItemWithCategory) => void;
};

export function MenuItemCard({ item, onEdit }: Props) {
  const locale = useLocale();
  const t = useTranslations("menu");

  const name = locale === "en" && item.name_en ? item.name_en : item.name_es;
  const categoryName =
    item.category
      ? locale === "en" && item.category.name_en
        ? item.category.name_en
        : item.category.name_es
      : null;

  async function handleToggle() {
    await toggleAvailability(item.id, !item.is_available);
  }

  return (
    <div
      className={cn(
        "bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4",
        "flex items-center gap-3",
        !item.is_available && "opacity-60"
      )}
    >
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-base truncate">{name}</h3>
          {categoryName && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] whitespace-nowrap">
              {categoryName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-stat text-[var(--primary)] font-bold">
            {formatCurrency(item.price)}
          </span>
          {item.cost_estimate !== null && item.cost_estimate > 0 && (
            <span className="text-xs text-[var(--muted-foreground)]">
              costo: {formatCurrency(item.cost_estimate)}
            </span>
          )}
        </div>
        <span
          className={cn(
            "inline-block text-xs mt-1 px-2 py-0.5 rounded-full",
            item.is_available
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          )}
        >
          {item.is_available ? t("available") : t("unavailable")}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onEdit(item)}
          className="touch-target p-2 rounded-xl hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
          aria-label={t("editItem")}
        >
          <Pencil size={20} />
        </button>
        <button
          onClick={handleToggle}
          className="touch-target p-2 rounded-xl hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
          aria-label={item.is_available ? t("unavailable") : t("available")}
        >
          {item.is_available ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}
