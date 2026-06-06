import { getTranslations } from "next-intl/server";
import { getWeeklyReport } from "@/lib/actions/reports";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { TrendingUp, ShoppingBag, Award, BarChart3 } from "lucide-react";

export default async function ReportsPage() {
  const t = await getTranslations("reports");
  const tOrders = await getTranslations("orders");
  const report = await getWeeklyReport();

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-2">
            <ShoppingBag size={20} />
          </div>
          <p className="text-stat font-bold">{report.totalOrders}</p>
          <p className="text-sm text-[var(--muted-foreground)]">{t("orderCount")}</p>
        </div>
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-2">
            <TrendingUp size={20} />
          </div>
          <p className="text-stat font-bold text-[var(--primary)]">{formatCurrency(report.totalRevenue)}</p>
          <p className="text-sm text-[var(--muted-foreground)]">{t("totalRevenue")}</p>
        </div>
      </div>

      {/* Daily breakdown */}
      <section>
        <h3 className="text-base font-semibold mb-3">{t("weekly")} — {t("dailySales")}</h3>
        <div className="space-y-2">
          {report.dailyBreakdown.map((day) => {
            const maxRevenue = Math.max(...report.dailyBreakdown.map((d) => d.revenue), 1);
            const pct = (day.revenue / maxRevenue) * 100;

            return (
              <div key={day.date} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{formatDate(day.date)}</span>
                  <span className="text-sm font-bold">{formatCurrency(day.revenue)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)] w-16 text-right">
                    {day.orders} {day.orders === 1 ? "pedido" : "pedidos"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular items */}
      {report.popularItems.length > 0 && (
        <section>
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Award size={18} className="text-[var(--primary)]" />
            {t("popularItems")}
          </h3>
          <div className="space-y-2">
            {report.popularItems.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3 bg-[var(--card)] rounded-xl border border-[var(--border)] p-3">
                <span className="w-7 h-7 rounded-full bg-[var(--muted)] flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium text-sm truncate">{item.name}</span>
                <span className="text-sm text-[var(--muted-foreground)]">x{item.quantity}</span>
                <span className="text-sm font-bold">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Revenue by source */}
      {report.revenueBySource.length > 0 && (
        <section>
          <h3 className="text-base font-semibold mb-3">{t("revenueBySource")}</h3>
          <div className="space-y-2">
            {report.revenueBySource.map((src) => (
              <div key={src.source} className="flex items-center justify-between bg-[var(--card)] rounded-xl border border-[var(--border)] p-3">
                <span className="font-medium text-sm">
                  {tOrders(`sources.${src.source}` as "sources.phone")}
                </span>
                <span className="font-bold text-[var(--primary)]">{formatCurrency(src.revenue)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {report.totalOrders === 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <BarChart3 size={48} className="text-[var(--muted-foreground)] mb-3" />
          <p className="text-[var(--muted-foreground)]">No hay datos de la semana</p>
        </div>
      )}
    </div>
  );
}
