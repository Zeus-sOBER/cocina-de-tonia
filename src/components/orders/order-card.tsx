"use client";

import { useTranslations } from "next-intl";
import { OrderStatusBadge } from "./order-status-badge";
import { updateOrderStatus } from "@/lib/actions/orders";
import { formatCurrency } from "@/lib/utils/format";
import { ORDER_STATUS_FLOW, type OrderStatus } from "@/lib/utils/constants";
import { ChevronRight, User } from "lucide-react";
import type { OrderWithItems } from "@/lib/actions/orders";

type Props = {
  order: OrderWithItems;
  onSelect?: (order: OrderWithItems) => void;
};

export function OrderCard({ order, onSelect }: Props) {
  const t = useTranslations("orders");

  const nextStatuses = ORDER_STATUS_FLOW[order.status as OrderStatus] ?? [];
  const primaryNext = nextStatuses[0]; // The main "advance" status

  async function handleAdvance() {
    if (!primaryNext) return;
    await updateOrderStatus(order.id, primaryNext);
  }

  const sourceLabel = t(`sources.${order.source}` as "sources.phone");
  const itemCount = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const itemSummary = order.order_items
    ?.slice(0, 2)
    .map((i) => `${i.quantity}x ${i.item_name_es}`)
    .join(", ");

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
      <div
        className="p-4 flex items-center gap-3 cursor-pointer active:bg-[var(--muted)]"
        onClick={() => onSelect?.(order)}
      >
        {/* Left: order info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-[var(--primary)]">
              #{order.order_number}
            </span>
            <OrderStatusBadge status={order.status as OrderStatus} />
            <span className="text-xs text-[var(--muted-foreground)]">
              {sourceLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <User size={14} className="text-[var(--muted-foreground)]" />
            <span className="font-medium truncate">{order.customer_name}</span>
          </div>

          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
            {itemCount} {itemCount === 1 ? "platillo" : "platillos"}
            {itemSummary ? ` · ${itemSummary}` : ""}
          </p>
        </div>

        {/* Right: total + advance */}
        <div className="flex items-center gap-2">
          <span className="text-stat font-bold">{formatCurrency(order.total)}</span>
          <ChevronRight size={18} className="text-[var(--muted-foreground)]" />
        </div>
      </div>

      {/* Quick advance button */}
      {primaryNext && (
        <button
          onClick={handleAdvance}
          className="w-full py-2.5 border-t border-[var(--border)]
                     text-sm font-semibold text-[var(--primary)]
                     hover:bg-[var(--muted)] active:bg-[var(--border)]
                     transition-colors touch-target"
        >
          → {t(`status.${primaryNext}` as "status.pending")}
        </button>
      )}
    </div>
  );
}
