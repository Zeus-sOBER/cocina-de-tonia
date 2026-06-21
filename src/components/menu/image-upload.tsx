"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { uploadMenuImage } from "@/lib/actions/storage";

type Props = {
  currentUrl?: string | null;
  onImageChange: (url: string | null) => void;
};

export function ImageUpload({ currentUrl, onImageChange }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    // Upload to Supabase
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadMenuImage(formData);
    setUploading(false);

    if (result.error) {
      setError(result.error);
      setPreview(currentUrl || null);
      return;
    }

    if (result.url) {
      setPreview(result.url);
      onImageChange(result.url);
    }

    // Clean up local preview
    URL.revokeObjectURL(localPreview);
  }

  function handleRemove() {
    setPreview(null);
    onImageChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-[var(--muted)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Menu item"
            className="w-full h-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-white" />
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white
                       flex items-center justify-center hover:bg-black/80"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-32 rounded-xl border-2 border-dashed border-[var(--border)]
                     hover:border-[var(--primary)] transition-colors
                     flex flex-col items-center justify-center gap-2
                     text-[var(--muted-foreground)]"
        >
          <Camera size={28} />
          <span className="text-sm font-medium">Agregar foto</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-[var(--danger)]">{error}</p>
      )}
    </div>
  );
}
