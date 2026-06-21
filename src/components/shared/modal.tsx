"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, className }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed inset-0 z-50 m-0 w-full h-full max-w-none max-h-none",
        "bg-[var(--background)] text-[var(--foreground)]",
        "p-0 overflow-y-auto",
        "backdrop:bg-black/50",
        className
      )}
      onClose={onClose}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <button
          onClick={onClose}
          className="touch-target p-2 rounded-full hover:bg-[var(--muted)]"
          aria-label="Close"
        >
          <X size={22} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-4 pb-safe">{children}</div>
    </dialog>
  );
}
