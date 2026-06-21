"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <AlertCircle size={48} className="text-[var(--danger)] mb-4" />
      <h2 className="text-lg font-bold mb-2">Algo salio mal</h2>
      <p className="text-sm text-[var(--muted-foreground)] mb-6">
        Ocurrio un error inesperado. Intenta de nuevo.
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold touch-target"
      >
        <RotateCcw size={18} />
        Reintentar
      </button>
    </div>
  );
}
