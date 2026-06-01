import { useTranslations } from "next-intl";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("settings");

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Language */}
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
        <h3 className="font-semibold mb-3">{t("language")}</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          Use the ES | EN toggle in the header
        </p>
      </div>

      {/* Theme */}
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
        <h3 className="font-semibold mb-3">{t("theme")}</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          Follows system preference
        </p>
      </div>

      {/* About */}
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
        <h3 className="font-semibold mb-3">{t("about")}</h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center">
            <span className="text-2xl">🍳</span>
          </div>
          <div>
            <p className="font-medium">Cocina de Mama</p>
            <p className="text-sm text-[var(--muted-foreground)]">v0.1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
