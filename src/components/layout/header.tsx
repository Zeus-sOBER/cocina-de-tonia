"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import type { Locale } from "@/lib/i18n/config";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function toggleLocale() {
    const newLocale: Locale = locale === "es" ? "en" : "es";
    router.replace(pathname, { locale: newLocale });
  }

  // Get page title from pathname
  function getTitle(): string {
    const path = pathname.split("/").filter(Boolean);
    if (path.length === 0) return t("dashboard");

    const segment = path[0];
    const titleMap: Record<string, string> = {
      pedidos: t("orders"),
      "menu-del-dia": t("dailyMenu"),
      menu: t("menu"),
      eventos: t("events"),
      inventario: t("inventory"),
      compras: t("shopping"),
      clientes: t("customers"),
      preparacion: t("prep"),
      reportes: t("reports"),
      ajustes: t("settings"),
      asistente: t("assistant"),
    };
    return titleMap[segment] || t("dashboard");
  }

  return (
    <header className="sticky top-0 z-40 bg-[var(--card)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
      <h1 className="text-lg font-bold text-[var(--foreground)] truncate">
        {getTitle()}
      </h1>
      <button
        onClick={toggleLocale}
        className="touch-target flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
                   bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]
                   transition-colors"
        aria-label={`Switch to ${locale === "es" ? "English" : "Espanol"}`}
      >
        <span className={locale === "es" ? "font-bold text-[var(--primary)]" : ""}>
          ES
        </span>
        <span className="text-[var(--border)]">|</span>
        <span className={locale === "en" ? "font-bold text-[var(--primary)]" : ""}>
          EN
        </span>
      </button>
    </header>
  );
}
