import { useTranslations } from "next-intl";
import { UtensilsCrossed } from "lucide-react";

export default function MenuPage() {
  const t = useTranslations("menu");

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                   bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold
                   touch-target-lg"
      >
        <UtensilsCrossed size={20} />
        {t("addItem")}
      </button>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-16">
        <UtensilsCrossed size={48} className="text-[var(--muted-foreground)] mb-3" />
        <p className="text-[var(--muted-foreground)]">{t("noItems")}</p>
      </div>
    </div>
  );
}
