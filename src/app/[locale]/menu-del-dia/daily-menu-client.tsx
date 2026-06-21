"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/shared/form-field";
import {
  createDailyMenu,
  updateDailyMenuStatus,
  type DailyMenuWithItems,
} from "@/lib/actions/daily-menu";
import { generateShareMessage } from "@/lib/utils/share-message";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { MenuItemWithCategory } from "@/lib/actions/menu";
import {
  BookOpen,
  Share2,
  Check,
  Copy,
  Plus,
  Minus,
  Megaphone,
  Lock,
} from "lucide-react";

type SelectedItem = { menu_item_id: string; quantity_available: number };

type Props = {
  todaysMenu: DailyMenuWithItems | null;
  availableMenuItems: MenuItemWithCategory[];
};

export function DailyMenuPageClient({ todaysMenu, availableMenuItems }: Props) {
  const locale = useLocale();
  const t = useTranslations("dailyMenu");
  const tCommon = useTranslations("common");

  const [isCreating, setIsCreating] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Toggle item in selection
  function toggleItem(menuItemId: string) {
    if (selectedItems.find((s) => s.menu_item_id === menuItemId)) {
      setSelectedItems(selectedItems.filter((s) => s.menu_item_id !== menuItemId));
    } else {
      setSelectedItems([...selectedItems, { menu_item_id: menuItemId, quantity_available: 30 }]);
    }
  }

  function updateQuantity(menuItemId: string, qty: number) {
    if (qty < 1) return;
    setSelectedItems(
      selectedItems.map((s) =>
        s.menu_item_id === menuItemId ? { ...s, quantity_available: qty } : s
      )
    );
  }

  async function handleCreate() {
    if (selectedItems.length === 0) return;
    setSaving(true);

    const today = new Date().toISOString().split("T")[0];
    await createDailyMenu({
      date: today,
      items: selectedItems,
    });

    setSaving(false);
    setIsCreating(false);
  }

  async function handleAnnounce() {
    if (!todaysMenu) return;
    await updateDailyMenuStatus(todaysMenu.id, "announced");
  }

  async function handleClose() {
    if (!todaysMenu) return;
    await updateDailyMenuStatus(todaysMenu.id, "closed");
  }

  async function handleCopyMessage() {
    if (!todaysMenu) return;
    const message = generateShareMessage(todaysMenu, locale);
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // === VIEW: No menu set ===
  if (!todaysMenu && !isCreating) {
    return (
      <div className="px-4 py-4 space-y-4">
        <Button
          variant="primary"
          onClick={() => setIsCreating(true)}
          className="w-full flex items-center justify-center gap-2"
        >
          <BookOpen size={20} />
          {t("setTodaysMenu")}
        </Button>

        <div className="flex flex-col items-center justify-center py-16">
          <BookOpen size={48} className="text-[var(--muted-foreground)] mb-3" />
          <p className="text-[var(--muted-foreground)] text-center">
            {t("setTodaysMenu")}
            <br />
            <span className="text-sm">
              {t("selectDishes")}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // === VIEW: Creating daily menu ===
  if (isCreating) {
    return (
      <div className="px-4 py-4 space-y-4">
        <h2 className="font-bold text-lg">{t("selectDishes")}</h2>

        {/* Available items to select */}
        <div className="space-y-2">
          {availableMenuItems.map((item) => {
            const isSelected = selectedItems.find((s) => s.menu_item_id === item.id);
            const name = locale === "en" && item.name_en ? item.name_en : item.name_es;

            return (
              <div
                key={item.id}
                className={cn(
                  "p-4 rounded-2xl border transition-colors",
                  isSelected
                    ? "border-[var(--primary)] bg-orange-50 dark:bg-orange-900/10"
                    : "border-[var(--border)] bg-[var(--card)]"
                )}
              >
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleItem(item.id)}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center",
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]"
                        : "border-[var(--border)]"
                    )}
                  >
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-[var(--primary)]">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>

                {/* Quantity input when selected */}
                {isSelected && (
                  <div className="flex items-center gap-3 mt-3 ml-9">
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {t("quantityToMake")}:
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, isSelected.quantity_available - 5)}
                        className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center touch-target"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-bold text-lg">
                        {isSelected.quantity_available}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, isSelected.quantity_available + 5)}
                        className="w-10 h-10 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center touch-target"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {availableMenuItems.length === 0 && (
          <p className="text-center text-[var(--muted-foreground)] py-8">
            No hay platillos disponibles. Agrega platillos en Menu primero.
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={() => setIsCreating(false)}
            className="flex-1"
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={saving || selectedItems.length === 0}
            className="flex-1"
          >
            {saving ? tCommon("loading") : tCommon("save")}
          </Button>
        </div>
      </div>
    );
  }

  // === VIEW: Menu exists ===
  if (!todaysMenu) return null; // TypeScript guard — unreachable due to early returns above
  const statusColors = {
    draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    announced: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    closed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Status badge */}
      <div className="flex items-center justify-between">
        <span className={cn("px-3 py-1 rounded-full text-sm font-semibold", statusColors[todaysMenu.status])}>
          {t(`status.${todaysMenu.status}` as "status.draft")}
        </span>
        <span className="text-sm text-[var(--muted-foreground)]">
          {new Date(todaysMenu.date).toLocaleDateString(locale === "es" ? "es-MX" : "en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Menu items with availability */}
      <div className="space-y-3">
        {todaysMenu.daily_menu_items.map((dmi) => {
          const name = locale === "en" && dmi.menu_item.name_en ? dmi.menu_item.name_en : dmi.menu_item.name_es;
          const remaining = dmi.quantity_available - dmi.quantity_ordered;
          const soldOut = remaining <= 0;

          return (
            <div
              key={dmi.id}
              className={cn(
                "p-4 rounded-2xl border bg-[var(--card)]",
                soldOut ? "border-red-200 opacity-60" : "border-[var(--border)]"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base">{name}</h3>
                  <p className="text-sm text-[var(--primary)] font-bold">
                    {formatCurrency(dmi.menu_item.price)}
                  </p>
                </div>
                <div className="text-right">
                  {soldOut ? (
                    <span className="text-sm font-bold text-[var(--danger)]">{t("soldOut")}</span>
                  ) : (
                    <div>
                      <span className="text-stat font-bold">{dmi.quantity_ordered}</span>
                      <span className="text-[var(--muted-foreground)]"> / {dmi.quantity_available}</span>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {remaining} {t("remaining")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="space-y-3 pt-2">
        {/* Share / Copy message */}
        <Button
          variant="primary"
          onClick={handleCopyMessage}
          className="w-full flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check size={20} />
              {t("messageCopied")}
            </>
          ) : (
            <>
              <Copy size={20} />
              {t("copyMessage")}
            </>
          )}
        </Button>

        {/* Status actions */}
        {todaysMenu.status === "draft" && (
          <Button
            variant="secondary"
            onClick={handleAnnounce}
            className="w-full flex items-center justify-center gap-2"
          >
            <Megaphone size={20} />
            {t("announce")}
          </Button>
        )}

        {todaysMenu.status === "announced" && (
          <Button
            variant="secondary"
            onClick={handleClose}
            className="w-full flex items-center justify-center gap-2"
          >
            <Lock size={20} />
            {t("status.closed")}
          </Button>
        )}
      </div>
    </div>
  );
}
