import { useTranslations } from "next-intl";
import { StatCard } from "@/components/dashboard/stat-card";
import { DailyMenuPreview } from "@/components/dashboard/daily-menu-preview";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import {
  ClipboardList,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  // Phase 1: placeholder data — will be replaced with real DB queries in Phase 3
  const stats = {
    todaysOrders: 0,
    revenue: 0,
    ordersReady: 0,
    alerts: 0,
  };

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-display text-[var(--foreground)]">
          {t("goodMorning")} 👋
        </h2>
        <p className="text-[var(--muted-foreground)] mt-1">
          {t("letsGetStarted")}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label={t("todaysOrders")}
          value={stats.todaysOrders}
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          label={t("revenue")}
          value={`$${stats.revenue}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          label={t("ordersReady")}
          value={stats.ordersReady}
          icon={CheckCircle2}
          color="orange"
        />
        <StatCard
          label={t("alerts")}
          value={stats.alerts}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Today's menu preview */}
      <DailyMenuPreview />

      {/* Recent orders */}
      <RecentOrders />

      {/* Low stock alerts */}
      <AlertsPanel />
    </div>
  );
}
