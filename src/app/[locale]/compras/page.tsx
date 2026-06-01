import { useTranslations } from "next-intl";
import { ShoppingCart } from "lucide-react";

export default function ShoppingPage() {
  const t = useTranslations("shopping");

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                   bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold
                   touch-target-lg"
      >
        <ShoppingCart size={20} />
        {t("generate")}
      </button>

      <div className="flex flex-col items-center justify-center py-16">
        <ShoppingCart size={48} className="text-[var(--muted-foreground)] mb-3" />
        <p className="text-[var(--muted-foreground)]">{t("noItems")}</p>
      </div>
    </div>
  );
}
