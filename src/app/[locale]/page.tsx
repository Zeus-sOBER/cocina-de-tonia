import { getTranslations } from "next-intl/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { DailyMenuPreview } from "@/components/dashboard/daily-menu-preview";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { getTodaysStats, getTodaysOrders } from "@/lib/actions/orders";
import { getTodaysMenu } from "@/lib/actions/daily-menu";
import { formatCurrency } from "@/lib/utils/format";
import {
  ClipboardList,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  const [stats, orders, dailyMenu] = await Promise.all([
    getTodaysStats(),
    getTodaysOrders(),
    getTodaysMenu(),
  ]);

  const recentOrders = orders.slice(0, 5);

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
          value={stats.totalOrders}
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          label={t("revenue")}
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          label={t("ordersReady")}
          value={stats.readyCount}
          icon={CheckCircle2}
          color="orange"
        />
        <StatCard
          label={t("alerts")}
          value={0}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Today's menu preview */}
      <DailyMenuPreview dailyMenu={dailyMenu} />

      {/* Recent orders */}
      <RecentOrders orders={recentOrders} />

      {/* Low stock alerts */}
      <AlertsPanel />
    </div>
  );
}
