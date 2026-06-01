import { getTodaysOrders } from "@/lib/actions/orders";
import { getTodaysMenu } from "@/lib/actions/daily-menu";
import { getMenuItems } from "@/lib/actions/menu";
import { getCustomers } from "@/lib/actions/customers";
import { OrdersPageClient } from "./orders-page-client";

export default async function OrdersPage() {
  const [orders, dailyMenu, menuItems, customers] = await Promise.all([
    getTodaysOrders(),
    getTodaysMenu(),
    getMenuItems(),
    getCustomers(),
  ]);

  const availableItems = menuItems.filter((m) => m.is_available);

  return (
    <OrdersPageClient
      initialOrders={orders}
      dailyMenu={dailyMenu}
      menuItems={availableItems}
      customers={customers}
    />
  );
}
