"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { ArrowRight, ClipboardList } from "lucide-react";

export function RecentOrders() {
  const t = useTranslations("dashboard");
  const tOrders = useTranslations("orders");

  // Phase 1: placeholder — will show actual orders in Phase 3
  const orders: never[] = [];

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-[var(--foreground)]">
          {t("recentOrders")}
        </h3>
        <Link
          href="/pedidos"
          className="text-sm text-[var(--primary)] font-medium flex items-center gap-1"
        >
          {tOrders("title")}
          <ArrowRight size={14} />
        </Link>
      </div>

      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
          <ClipboardList
            size={40}
            className="text-[var(--muted-foreground)] mb-2"
          />
          <p className="text-sm text-[var(--muted-foreground)]">
            {tOrders("title")} — 0
          </p>
        </div>
      )}
    </section>
  );
}
