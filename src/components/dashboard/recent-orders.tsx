"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { ArrowRight, ClipboardList } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatCurrency } from "@/lib/utils/format";
import type { OrderWithItems } from "@/lib/actions/orders";
import type { OrderStatus } from "@/lib/utils/constants";

type Props = {
  orders?: OrderWithItems[];
};

export function RecentOrders({ orders = [] }: Props) {
  const t = useTranslations("dashboard");
  const tOrders = useTranslations("orders");

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-[var(--foreground)]">
          {t("recentOrders")}
        </h3>
        <Link
          href="/pedidos"
          className="text-sm text-[var(--primary)] font-medium flex items-center gap-1"
        >
          {tOrders("title")}
          <ArrowRight size={14} />
        </Link>
      </div>

      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
          <ClipboardList
            size={40}
            className="text-[var(--muted-foreground)] mb-2"
          />
          <p className="text-sm text-[var(--muted-foreground)]">
            {tOrders("title")} — 0
          </p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-2">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/pedidos`}
              className="flex items-center justify-between p-3 bg-[var(--card)] rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[var(--primary)]">
                  #{order.order_number}
                </span>
                <span className="text-sm truncate max-w-32">
                  {order.customer_name}
                </span>
                <OrderStatusBadge status={order.status as OrderStatus} />
              </div>
              <span className="text-sm font-bold">
                {formatCurrency(order.total)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
