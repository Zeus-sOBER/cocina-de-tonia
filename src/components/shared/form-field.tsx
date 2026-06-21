"use client";

import { cn } from "@/lib/utils/cn";

type Props = {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function FormField({ label, id, error, required, children, className }: Props) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[var(--foreground)]"
      >
        {label}
        {required && <span className="text-[var(--danger)] ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-[var(--danger)]">{error}</p>
      )}
    </div>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full px-4 py-3 rounded-xl border border-[var(--border)]",
        "bg-[var(--card)] text-[var(--foreground)] text-base",
        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent",
        "placeholder:text-[var(--muted-foreground)]",
        "touch-target",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full px-4 py-3 rounded-xl border border-[var(--border)]",
        "bg-[var(--card)] text-[var(--foreground)] text-base",
        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent",
        "touch-target appearance-none",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full px-4 py-3 rounded-xl border border-[var(--border)]",
        "bg-[var(--card)] text-[var(--foreground)] text-base",
        "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent",
        "placeholder:text-[var(--muted-foreground)]",
        "resize-none",
        className
      )}
      rows={3}
      {...props}
    />
  );
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const variants = {
    primary:
      "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90",
    secondary:
      "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--border)]",
    danger:
      "bg-[var(--danger)] text-white hover:opacity-90",
    ghost:
      "text-[var(--muted-foreground)] hover:bg-[var(--muted)]",
  };

  return (
    <button
      className={cn(
        "px-4 py-3 rounded-xl font-semibold text-base transition-all",
        "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
        "touch-target",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
