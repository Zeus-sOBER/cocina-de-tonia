"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAssistantContext() {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const [todayOrders, weekOrders, ingredients, menuItems, recentPurchases] =
      await Promise.all([
        supabase
          .from("orders")
          .select(
            "id, status, total, source, customer_name, order_items(item_name_es, quantity, subtotal)"
          )
          .eq("delivery_date", today)
          .neq("status", "cancelled"),
        supabase
          .from("orders")
          .select("id, total, delivery_date, status")
          .gte("delivery_date", weekAgo)
          .neq("status", "cancelled"),
        supabase
          .from("ingredients")
          .select(
            "name_es, current_stock, min_stock, cost_per_unit, unit, category"
          ),
        supabase
          .from("menu_items")
          .select("name_es, price, cost_estimate, is_available"),
        supabase
          .from("inventory_transactions")
          .select(
            "quantity, notes, created_at, ingredient:ingredients(name_es, unit)"
          )
          .eq("transaction_type", "purchase")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

    return {
      today,
      todayOrders: todayOrders.data ?? [],
      weekOrders: weekOrders.data ?? [],
      ingredients: ingredients.data ?? [],
      menuItems: menuItems.data ?? [],
      recentPurchases: recentPurchases.data ?? [],
    };
  } catch {
    return {
      today: new Date().toISOString().split("T")[0],
      todayOrders: [],
      weekOrders: [],
      ingredients: [],
      menuItems: [],
      recentPurchases: [],
    };
  }
}

export async function formatContextForPrompt(ctx: Awaited<ReturnType<typeof getAssistantContext>>): Promise<string> {
  const todayStats = {
    count: ctx.todayOrders.length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    revenue: ctx.todayOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    byStatus: ctx.todayOrders.reduce((acc: Record<string, number>, o: any) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const weekStats = {
    count: ctx.weekOrders.length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    revenue: ctx.weekOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lowStock = ctx.ingredients.filter((i: any) => i.current_stock <= i.min_stock && i.min_stock > 0);

  const sections = [
    `## Fecha de hoy: ${ctx.today}`,

    `## Pedidos de Hoy\nTotal: ${todayStats.count} pedidos, $${todayStats.revenue.toFixed(2)} USD\nPor estado: ${JSON.stringify(todayStats.byStatus)}`,

    `## Resumen de la Semana\nTotal: ${weekStats.count} pedidos, $${weekStats.revenue.toFixed(2)} USD`,

    `## Inventario (${ctx.ingredients.length} ingredientes)\n${ctx.ingredients
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((i: any) => `- ${i.name_es}: ${i.current_stock} ${i.unit} (min: ${i.min_stock}, costo: $${i.cost_per_unit || 0}/${i.unit})`)
      .join("\n")}`,

    lowStock.length > 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? `## Stock Bajo (ALERTA)\n${lowStock.map((i: any) => `- ${i.name_es}: ${i.current_stock} ${i.unit} (minimo: ${i.min_stock})`).join("\n")}`
      : "## Stock Bajo: Ninguno",

    `## Menu Activo (${ctx.menuItems.length} platillos)\n${ctx.menuItems
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((m: any) => `- ${m.name_es}: $${m.price} ${m.is_available ? "(disponible)" : "(no disponible)"}${m.cost_estimate ? ` costo est: $${m.cost_estimate}` : ""}`)
      .join("\n")}`,

    ctx.recentPurchases.length > 0
      ? `## Compras Recientes\n${ctx.recentPurchases
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) => `- ${(p as any).ingredient?.name_es || "?"}: ${p.quantity} ${(p as any).ingredient?.unit || ""} ${p.notes ? `(${p.notes})` : ""} — ${p.created_at?.split("T")[0]}`)
          .join("\n")}`
      : "## Compras Recientes: Ninguna",
  ];

  return sections.join("\n\n");
}
