"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { ORDER_STATUS_COLORS, type OrderStatus } from "@/lib/utils/constants";

type Props = {
  status: OrderStatus;
  className?: string;
};

export function OrderStatusBadge({ status, className }: Props) {
  const t = useTranslations("orders.status");

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
        ORDER_STATUS_COLORS[status],
        className
      )}
    >
      {t(status)}
    </span>
  );
}
