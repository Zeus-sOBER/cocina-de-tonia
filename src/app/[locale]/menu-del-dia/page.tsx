import { useTranslations } from "next-intl";
import { BookOpen } from "lucide-react";

export default function DailyMenuPage() {
  const t = useTranslations("dailyMenu");

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                   bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold
                   touch-target-lg"
      >
        <BookOpen size={20} />
        {t("setTodaysMenu")}
      </button>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-16">
        <BookOpen size={48} className="text-[var(--muted-foreground)] mb-3" />
        <p className="text-[var(--muted-foreground)]">
          {t("title")} — Coming in Phase 3
        </p>
      </div>
    </div>
  );
}
