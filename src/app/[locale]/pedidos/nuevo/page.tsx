import { useTranslations } from "next-intl";

export default function NewOrderPage() {
  const t = useTranslations("orders");

  return (
    <div className="px-4 py-4">
      <p className="text-[var(--muted-foreground)]">
        {t("newOrder")} — Coming in Phase 3
      </p>
    </div>
  );
}
