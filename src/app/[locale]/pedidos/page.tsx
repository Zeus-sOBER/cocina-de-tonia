import { useTranslations } from "next-intl";
import { ClipboardList, Plus } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";

export default function OrdersPage() {
  const t = useTranslations("orders");

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Action buttons */}
      <div className="flex gap-3">
        <Link
          href="/pedidos/nuevo"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                     bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold
                     touch-target-lg"
        >
          <Plus size={20} />
          {t("newOrder")}
        </Link>
        <button
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl
                     bg-[var(--muted)] text-[var(--foreground)] font-medium
                     touch-target-lg"
        >
          {t("walkUpSale")}
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {["all", "pending", "confirmed", "preparing", "ready", "delivered"].map(
          (status) => (
            <button
              key={status}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                         bg-[var(--muted)] text-[var(--muted-foreground)]
                         touch-target"
            >
              {status === "all"
                ? t("all")
                : t(`status.${status}` as "status.pending")}
            </button>
          )
        )}
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-16">
        <ClipboardList size={48} className="text-[var(--muted-foreground)] mb-3" />
        <p className="text-[var(--muted-foreground)]">
          {t("title")} — 0
        </p>
      </div>
    </div>
  );
}
