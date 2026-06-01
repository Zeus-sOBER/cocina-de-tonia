"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { BookOpen, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import type { DailyMenuWithItems } from "@/lib/actions/daily-menu";

type Props = {
  dailyMenu?: DailyMenuWithItems | null;
};

export function DailyMenuPreview({ dailyMenu }: Props) {
  const locale = useLocale();
  const t = useTranslations("dashboard");

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-[var(--foreground)]">
          {t("todaysMenu")}
        </h3>
        <Link
          href="/menu-del-dia"
          className="text-sm text-[var(--primary)] font-medium flex items-center gap-1"
        >
          {dailyMenu ? t("availability") : t("setMenu")}
          <ArrowRight size={14} />
        </Link>
      </div>

      {!dailyMenu && (
        <Link
          href="/menu-del-dia"
          className="flex items-center gap-4 p-4 bg-[var(--card)] rounded-2xl border border-dashed border-[var(--border)] hover:border-[var(--primary)] transition-colors touch-target-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-[var(--primary)]">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="font-medium text-[var(--foreground)]">
              {t("noMenuSet")}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {t("setMenu")} →
            </p>
          </div>
        </Link>
      )}

      {dailyMenu && (
        <div className="space-y-2">
          {dailyMenu.daily_menu_items.map((dmi) => {
            const name = locale === "en" && dmi.menu_item.name_en
              ? dmi.menu_item.name_en
              : dmi.menu_item.name_es;
            const pct = dmi.quantity_available > 0
              ? (dmi.quantity_ordered / dmi.quantity_available) * 100
              : 0;

            return (
              <div
                key={dmi.id}
                className="bg-[var(--card)] rounded-xl p-3 border border-[var(--border)]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-sm">{name}</span>
                  <span className="text-sm text-[var(--primary)] font-bold">
                    {formatCurrency(dmi.menu_item.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--primary)] rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                    {dmi.quantity_ordered}/{dmi.quantity_available}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
