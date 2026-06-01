import { getTodaysMenu } from "@/lib/actions/daily-menu";
import { getMenuItems } from "@/lib/actions/menu";
import { DailyMenuPageClient } from "./daily-menu-client";

export default async function DailyMenuPage() {
  const [todaysMenu, menuItems] = await Promise.all([
    getTodaysMenu(),
    getMenuItems(),
  ]);

  const availableItems = menuItems.filter((m) => m.is_available);

  return (
    <DailyMenuPageClient
      todaysMenu={todaysMenu}
      availableMenuItems={availableItems}
    />
  );
}
