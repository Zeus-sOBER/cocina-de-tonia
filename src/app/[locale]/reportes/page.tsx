import { useTranslations } from "next-intl";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  const t = useTranslations("reports");

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex flex-col items-center justify-center py-16">
        <BarChart3 size={48} className="text-[var(--muted-foreground)] mb-3" />
        <p className="text-[var(--muted-foreground)]">
          {t("title")} — Coming in Phase 8
        </p>
      </div>
    </div>
  );
}
