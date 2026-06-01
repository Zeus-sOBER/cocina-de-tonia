"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/lib/i18n/navigation";
import { Link } from "@/lib/i18n/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  ChefHat,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";
import { MoreMenu } from "./more-menu";

type NavItem = {
  key: string;
  href: string;
  icon: typeof LayoutDashboard;
  isPrimary?: boolean;
};

const navItems: NavItem[] = [
  { key: "dashboard", href: "/", icon: LayoutDashboard },
  { key: "orders", href: "/pedidos", icon: ClipboardList },
  { key: "newOrder", href: "/pedidos/nuevo", icon: PlusCircle, isPrimary: true },
  { key: "prep", href: "/preparacion", icon: ChefHat },
];

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)] border-t border-[var(--border)] pb-safe"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            if (item.isPrimary) {
              return (
                <Link
                  key={item.key}
                  href={item.href as "/"}
                  className="flex flex-col items-center justify-center -mt-4"
                  aria-label={t(item.key as never)}
                >
                  <div className="w-14 h-14 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    <Icon size={28} strokeWidth={2.5} />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.key}
                href={item.href as "/"}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 touch-target",
                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)]"
                )}
                aria-label={t(item.key as never)}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={24} />
                <span className="text-xs mt-0.5 font-medium">
                  {t(item.key as never)}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-3 touch-target",
              moreOpen
                ? "text-[var(--primary)]"
                : "text-[var(--muted-foreground)]"
            )}
            aria-label={t("more")}
            aria-expanded={moreOpen}
          >
            <MoreHorizontal size={24} />
            <span className="text-xs mt-0.5 font-medium">{t("more")}</span>
          </button>
        </div>
      </nav>

      {/* More menu overlay */}
      {moreOpen && <MoreMenu onClose={() => setMoreOpen(false)} />}
    </>
  );
}
