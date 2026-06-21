"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { Button } from "@/components/shared/form-field";
import { ReceiptReview } from "./receipt-review";
import { scanReceipt, confirmReceipt, type ConfirmReceiptData } from "@/lib/actions/receipt-scanner";
import { getIngredients } from "@/lib/actions/ingredients";
import type { ReceiptData } from "@/lib/ai/types";
import type { Ingredient } from "@/lib/supabase/types";
import { Camera, Loader2, CheckCircle2, AlertCircle, RotateCcw, Package } from "lucide-react";

type ScanState = "idle" | "uploading" | "scanning" | "reviewing" | "confirming" | "done" | "error";

export function ReceiptScanner() {
  const t = useTranslations("receipt");
  const router = useRouter();

  const [state, setState] = useState<ScanState>("idle");
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ itemsProcessed: number; newCreated: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    setPreview(URL.createObjectURL(file));
    setState("scanning");
    setError("");

    // Scan
    const formData = new FormData();
    formData.append("file", file);

    const scanResult = await scanReceipt(formData);

    if (scanResult.error) {
      setError(scanResult.error);
      setState("error");
      return;
    }

    if (scanResult.data) {
      setReceiptData(scanResult.data);
      // Fetch ingredients for matching
      const ings = await getIngredients();
      setIngredients(ings);
      setState("reviewing");
    }
  }

  async function handleConfirm(data: ConfirmReceiptData) {
    setState("confirming");
    const confirmResult = await confirmReceipt(data);

    if (confirmResult.error) {
      setError(confirmResult.error);
      setState("error");
      return;
    }

    setResult({
      itemsProcessed: confirmResult.itemsProcessed ?? 0,
      newCreated: confirmResult.newCreated ?? 0,
    });
    setState("done");
  }

  function handleReset() {
    setState("idle");
    setReceiptData(null);
    setPreview(null);
    setError("");
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  // === IDLE: Upload prompt ===
  if (state === "idle") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-48 rounded-2xl border-2 border-dashed border-[var(--border)]
                     hover:border-[var(--primary)] transition-colors
                     flex flex-col items-center justify-center gap-3
                     text-[var(--muted-foreground)] bg-[var(--card)]"
        >
          <Camera size={40} className="text-[var(--primary)]" />
          <span className="text-base font-semibold">{t("takePhoto")}</span>
          <span className="text-sm">{t("selectPhoto")}</span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  // === SCANNING: Loading ===
  if (state === "scanning") {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        {preview && (
          <div className="w-32 h-40 rounded-xl overflow-hidden opacity-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Receipt" className="w-full h-full object-cover" />
          </div>
        )}
        <Loader2 size={40} className="animate-spin text-[var(--primary)]" />
        <p className="text-lg font-semibold">{t("scanning")}</p>
      </div>
    );
  }

  // === REVIEWING: Show extracted data ===
  if (state === "reviewing" && receiptData) {
    return (
      <ReceiptReview
        data={receiptData}
        ingredients={ingredients}
        onConfirm={handleConfirm}
        onCancel={handleReset}
      />
    );
  }

  // === CONFIRMING: Saving ===
  if (state === "confirming") {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 size={40} className="animate-spin text-[var(--primary)]" />
        <p className="text-lg font-semibold">{t("confirming")}</p>
      </div>
    );
  }

  // === DONE: Success ===
  if (state === "done" && result) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <CheckCircle2 size={56} className="text-[var(--success)]" />
        <div className="text-center">
          <h2 className="text-xl font-bold">{t("success")}</h2>
          <p className="text-[var(--muted-foreground)] mt-2">
            {t("itemsUpdated", { count: result.itemsProcessed })}
          </p>
          {result.newCreated > 0 && (
            <p className="text-[var(--muted-foreground)]">
              {t("newCreated", { count: result.newCreated })}
            </p>
          )}
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" onClick={handleReset} className="flex-1 flex items-center justify-center gap-2">
            <RotateCcw size={18} />
            {t("scanAnother")}
          </Button>
          <Button variant="primary" onClick={() => router.push("/inventario")} className="flex-1 flex items-center justify-center gap-2">
            <Package size={18} />
            {t("viewInventory")}
          </Button>
        </div>
      </div>
    );
  }

  // === ERROR ===
  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <AlertCircle size={56} className="text-[var(--danger)]" />
        <div className="text-center">
          <p className="text-lg font-semibold text-[var(--danger)]">{error}</p>
        </div>
        <Button variant="primary" onClick={handleReset} className="flex items-center gap-2">
          <RotateCcw size={18} />
          {t("retry")}
        </Button>
      </div>
    );
  }

  return null;
}
