import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const colorMap = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
} as const;

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: keyof typeof colorMap;
};

export function StatCard({ label, value, icon: Icon, color }: Props) {
  return (
    <div className="bg-[var(--card)] rounded-2xl p-4 border border-[var(--border)]">
      <div className="flex items-center justify-between mb-2">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            colorMap[color]
          )}
        >
          <Icon size={20} />
        </div>
      </div>
      <p className="text-stat text-[var(--foreground)]">{value}</p>
      <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{label}</p>
    </div>
  );
}
