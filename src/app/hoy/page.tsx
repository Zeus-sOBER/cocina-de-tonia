import { getTodaysMenu } from "@/lib/actions/daily-menu";
import { formatCurrency } from "@/lib/utils/format";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu de Hoy — Cocina de Tonia",
  description: "Ve el menu de hoy y haz tu pedido",
  openGraph: {
    title: "Menu de Hoy — Cocina de Tonia",
    description: "Ve el menu de hoy y haz tu pedido",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function PublicMenuPage() {
  const dailyMenu = await getTodaysMenu();

  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <html lang="es">
      <body className="min-h-screen bg-[#FFF7ED] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F1F5F9]">
        <div className="max-w-lg mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-[#EA580C] flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🍳</span>
            </div>
            <h1 className="text-3xl font-bold">Cocina de Tonia</h1>
            <p className="text-[#64748B] mt-1 capitalize">{today}</p>
          </div>

          {/* Menu */}
          {dailyMenu && dailyMenu.daily_menu_items.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center text-[#EA580C]">
                Menu del Dia
              </h2>

              {dailyMenu.daily_menu_items.map((dmi) => {
                const remaining = dmi.quantity_available - dmi.quantity_ordered;
                const soldOut = remaining <= 0;

                return (
                  <div
                    key={dmi.id}
                    className={`bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden shadow-sm border border-[#E2E8F0] dark:border-[#334155] ${
                      soldOut ? "opacity-50" : ""
                    }`}
                  >
                    {/* Image */}
                    {dmi.menu_item.image_url && (
                      <div className="w-full h-48 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={dmi.menu_item.image_url}
                          alt={dmi.menu_item.name_es}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold">
                            {dmi.menu_item.name_es}
                          </h3>
                          {dmi.menu_item.description_es && (
                            <p className="text-sm text-[#64748B] mt-1">
                              {dmi.menu_item.description_es}
                            </p>
                          )}
                        </div>
                        <span className="text-xl font-bold text-[#EA580C] whitespace-nowrap">
                          {formatCurrency(dmi.menu_item.price)}
                        </span>
                      </div>

                      {soldOut && (
                        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Agotado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Call to action */}
              <div className="text-center pt-4 space-y-3">
                <p className="text-[#64748B] text-sm">
                  Para hacer tu pedido:
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href="tel:"
                    className="w-full py-3.5 px-4 rounded-xl bg-[#EA580C] text-white font-semibold text-base
                               flex items-center justify-center gap-2"
                  >
                    📞 Llamar para pedir
                  </a>
                  <p className="text-xs text-[#94A3B8]">
                    Pedidos antes de las 8am
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* No menu today */
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🍽️</span>
              <h2 className="text-xl font-bold mb-2">
                No hay menu disponible hoy
              </h2>
              <p className="text-[#64748B]">
                Vuelve a revisar mas tarde o contactanos directamente
              </p>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-12 text-center text-xs text-[#94A3B8]">
            <p>Cocina de Tonia</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
