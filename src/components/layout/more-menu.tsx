"use client";

import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/lib/i18n/navigation";
import {
  UtensilsCrossed,
  CalendarHeart,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  X,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const menuItems = [
  { key: "dailyMenu", href: "/menu-del-dia", icon: BookOpen },
  { key: "menu", href: "/menu", icon: UtensilsCrossed },
  { key: "events", href: "/eventos", icon: CalendarHeart },
  { key: "inventory", href: "/inventario", icon: Package },
  { key: "shopping", href: "/compras", icon: ShoppingCart },
  { key: "customers", href: "/clientes", icon: Users },
  { key: "reports", href: "/reportes", icon: BarChart3 },
  { key: "settings", href: "/ajustes", icon: Settings },
] as const;

export function MoreMenu({ onClose }: { onClose: () => void }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  function isActive(href: string): boolean {
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden
      />

      {/* Menu panel */}
      <div className="fixed bottom-16 left-0 right-0 z-50 mx-4 mb-2 bg-[var(--card)] rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <span className="text-sm font-semibold text-[var(--muted-foreground)]">
            {t("more")}
          </span>
          <button
            onClick={onClose}
            className="touch-target p-1 rounded-full hover:bg-[var(--muted)]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1 p-3">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex flex-col items-center justify-center py-3 px-2 rounded-xl touch-target transition-colors",
                  active
                    ? "bg-orange-100 text-[var(--primary)] dark:bg-orange-900/30"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                )}
              >
                <Icon size={24} />
                <span className="text-xs mt-1.5 font-medium text-center leading-tight">
                  {t(item.key)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
