"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { BookOpen, ArrowRight } from "lucide-react";

export function DailyMenuPreview() {
  const t = useTranslations("dashboard");

  // Phase 1: placeholder — will show actual daily menu in Phase 3
  const hasMenu = false;

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
          {hasMenu ? t("availability") : t("setMenu")}
          <ArrowRight size={14} />
        </Link>
      </div>

      {!hasMenu && (
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
    </section>
  );
}
