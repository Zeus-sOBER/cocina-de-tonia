import { useTranslations } from "next-intl";
import { ChefHat } from "lucide-react";

export default function PrepPage() {
  const t = useTranslations("prep");

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                   bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold
                   touch-target-lg"
      >
        <ChefHat size={20} />
        {t("generateList")}
      </button>

      <div className="flex flex-col items-center justify-center py-16">
        <ChefHat size={48} className="text-[var(--muted-foreground)] mb-3" />
        <p className="text-[var(--muted-foreground)]">{t("noTasks")}</p>
      </div>
    </div>
  );
}
