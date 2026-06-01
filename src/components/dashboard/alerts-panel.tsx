"use client";

import { useTranslations } from "next-intl";

export function AlertsPanel() {
  const t = useTranslations("dashboard");

  // Phase 1: placeholder — will show real alerts in Phase 5
  const alerts: never[] = [];

  if (alerts.length === 0) return null;

  return (
    <section>
      <h3 className="text-base font-semibold text-[var(--foreground)] mb-3">
        {t("lowStock")}
      </h3>
      {/* Alert items will be rendered here in Phase 5 */}
    </section>
  );
}
