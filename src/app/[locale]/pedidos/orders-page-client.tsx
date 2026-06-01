"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ClipboardList, Plus, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { OrderCard } from "@/components/orders/order-card";
import { OrderForm } from "@/components/orders/order-form";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/utils/constants";
import type { OrderWithItems } from "@/lib/actions/orders";
import type { DailyMenuWithItems } from "@/lib/actions/daily-menu";
import type { MenuItem, Customer } from "@/lib/supabase/types";
import type { MenuItemWithCategory } from "@/lib/actions/menu";

type Props = {
  initialOrders: OrderWithItems[];
  dailyMenu: DailyMenuWithItems | null;
  menuItems: MenuItemWithCategory[];
  customers: Customer[];
};

const STATUS_FILTERS = ["all", ...ORDER_STATUSES.filter((s) => s !== "cancelled")] as const;

export function OrdersPageClient({ initialOrders, dailyMenu, menuItems, customers }: Props) {
  const t = useTranslations("orders");

  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showWalkUp, setShowWalkUp] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter orders
  const filteredOrders = initialOrders.filter((order) => {
    if (statusFilter === "all") return order.status !== "cancelled";
    return order.status === statusFilter;
  });

  // Count per status
  const statusCounts = ORDER_STATUSES.reduce(
    (acc, status) => {
      acc[status] = initialOrders.filter((o) => o.status === status).length;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowNewOrder(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                     bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold
                     touch-target-lg"
        >
          <Plus size={20} />
          {t("newOrder")}
        </button>
        <button
          onClick={() => setShowWalkUp(true)}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl
                     bg-[var(--muted)] text-[var(--foreground)] font-medium
                     touch-target-lg"
        >
          <ShoppingBag size={20} />
          {t("walkUpSale")}
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {STATUS_FILTERS.map((status) => {
          const isActive = statusFilter === status;
          const count = status === "all"
            ? initialOrders.filter((o) => o.status !== "cancelled").length
            : statusCounts[status] ?? 0;

          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap touch-target",
                isActive
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              )}
            >
              {status === "all"
                ? t("all")
                : t(`status.${status}` as "status.pending")}
              {count > 0 && ` (${count})`}
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {/* Empty state */}
      {filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <ClipboardList size={48} className="text-[var(--muted-foreground)] mb-3" />
          <p className="text-[var(--muted-foreground)]">
            {statusFilter === "all" ? `${t("title")} — 0` : `0 ${t(`status.${statusFilter}` as "status.pending")}`}
          </p>
        </div>
      )}

      {/* Order count */}
      {filteredOrders.length > 0 && (
        <p className="text-center text-sm text-[var(--muted-foreground)]">
          {filteredOrders.length} {filteredOrders.length === 1 ? "pedido" : "pedidos"}
        </p>
      )}

      {/* New Order form */}
      <OrderForm
        open={showNewOrder}
        onClose={() => setShowNewOrder(false)}
        menuItems={menuItems as MenuItem[]}
        customers={customers}
        dailyMenu={dailyMenu}
      />

      {/* Walk-up sale form */}
      <OrderForm
        open={showWalkUp}
        onClose={() => setShowWalkUp(false)}
        menuItems={menuItems as MenuItem[]}
        customers={customers}
        dailyMenu={dailyMenu}
        isWalkUp
      />
    </div>
  );
}
