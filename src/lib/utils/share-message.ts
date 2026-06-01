import type { DailyMenuWithItems } from "@/lib/actions/daily-menu";
import { formatCurrency } from "./format";

/**
 * Generate a formatted share message for Facebook/WhatsApp
 */
export function generateShareMessage(
  menu: DailyMenuWithItems,
  locale: string = "es"
): string {
  const dateStr = new Date(menu.date).toLocaleDateString(
    locale === "es" ? "es-MX" : "en-US",
    { weekday: "long", month: "long", day: "numeric" }
  );

  const lines: string[] = [];

  if (locale === "es") {
    lines.push(`🍽️ *Menu del Dia* - ${dateStr}`);
    lines.push("");

    menu.daily_menu_items.forEach((item, i) => {
      const emoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"][i] ?? "▪️";
      lines.push(
        `${emoji} ${item.menu_item.name_es} — ${formatCurrency(item.menu_item.price)}`
      );
      if (item.menu_item.description_es) {
        lines.push(`   ${item.menu_item.description_es}`);
      }
    });

    lines.push("");
    lines.push("📞 Haz tu pedido por mensaje o llamada!");
    lines.push("⏰ Pedidos antes de las 8am");
  } else {
    lines.push(`🍽️ *Daily Menu* - ${dateStr}`);
    lines.push("");

    menu.daily_menu_items.forEach((item, i) => {
      const emoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"][i] ?? "▪️";
      const name = item.menu_item.name_en || item.menu_item.name_es;
      lines.push(`${emoji} ${name} — ${formatCurrency(item.menu_item.price)}`);
      const desc = item.menu_item.description_en || item.menu_item.description_es;
      if (desc) {
        lines.push(`   ${desc}`);
      }
    });

    lines.push("");
    lines.push("📞 Place your order by message or call!");
    lines.push("⏰ Orders before 8am");
  }

  return lines.join("\n");
}
