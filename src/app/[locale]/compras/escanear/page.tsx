import { useTranslations } from "next-intl";
import { ReceiptScanner } from "@/components/receipts/receipt-scanner";

export default function ScanReceiptPage() {
  const t = useTranslations("receipt");

  return (
    <div className="px-4 py-4">
      <p className="text-sm text-[var(--muted-foreground)] mb-4">
        {t("takePhoto")}
      </p>
      <ReceiptScanner />
    </div>
  );
}
