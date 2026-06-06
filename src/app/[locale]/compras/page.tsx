import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { ShoppingCart, Camera } from "lucide-react";

export default function ShoppingPage() {
  const t = useTranslations("shopping");
  const tReceipt = useTranslations("receipt");

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex gap-3">
        <button
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                     bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold
                     touch-target-lg"
        >
          <ShoppingCart size={20} />
          {t("generate")}
        </button>
        <Link
          href="/compras/escanear"
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl
                     bg-[var(--muted)] text-[var(--foreground)] font-medium
                     touch-target-lg"
        >
          <Camera size={20} />
          {tReceipt("scan")}
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center py-16">
        <ShoppingCart size={48} className="text-[var(--muted-foreground)] mb-3" />
        <p className="text-[var(--muted-foreground)]">{t("noItems")}</p>
      </div>
    </div>
  );
}
