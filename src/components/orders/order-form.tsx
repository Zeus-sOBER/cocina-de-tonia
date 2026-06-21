"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Modal } from "@/components/shared/modal";
import { FormField, Input, Select, Button } from "@/components/shared/form-field";
import { createOrder, type CreateOrderData } from "@/lib/actions/orders";
import { quickAddCustomer } from "@/lib/actions/customers";
import { formatCurrency } from "@/lib/utils/format";
import type { MenuItem, Customer } from "@/lib/supabase/types";
import type { DailyMenuWithItems } from "@/lib/actions/daily-menu";
import { Minus, Plus, Search, UserPlus } from "lucide-react";
import { ORDER_SOURCES, type OrderSource } from "@/lib/utils/constants";

type CartItem = {
  menu_item_id: string;
  name_es: string;
  price: number;
  quantity: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  customers: Customer[];
  dailyMenu?: DailyMenuWithItems | null;
  isWalkUp?: boolean;
};

export function OrderForm({ open, onClose, menuItems, customers, dailyMenu, isWalkUp }: Props) {
  const locale = useLocale();
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");

  // Step tracking
  const [step, setStep] = useState<"customer" | "items" | "review">(
    isWalkUp ? "items" : "customer"
  );

  // Customer
  const [customerId, setCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState(isWalkUp ? "Venta directa" : "");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  // Order details
  const [source, setSource] = useState<OrderSource>(isWalkUp ? "walk_in" : "phone");
  const [cart, setCart] = useState<CartItem[]>([]);

  // State
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Filtered customers
  const filteredCustomers = customerSearch.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.phone?.includes(customerSearch)
      )
    : customers.slice(0, 10);

  // Items to show — prefer daily menu items if available
  const availableItems = dailyMenu
    ? dailyMenu.daily_menu_items.map((dmi) => dmi.menu_item)
    : menuItems.filter((m) => m.is_available);

  // Cart operations
  function addToCart(item: MenuItem) {
    const existing = cart.find((c) => c.menu_item_id === item.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.menu_item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([...cart, { menu_item_id: item.id, name_es: item.name_es, price: item.price, quantity: 1 }]);
    }
  }

  function updateCartQuantity(menuItemId: string, quantity: number) {
    if (quantity <= 0) {
      setCart(cart.filter((c) => c.menu_item_id !== menuItemId));
    } else {
      setCart(cart.map((c) => c.menu_item_id === menuItemId ? { ...c, quantity } : c));
    }
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartItemCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  // Customer selection
  function selectCustomer(customer: Customer) {
    setCustomerId(customer.id);
    setCustomerName(customer.name);
    setStep("items");
  }

  async function handleQuickAdd() {
    if (!newCustomerName.trim()) return;
    const result = await quickAddCustomer(newCustomerName.trim(), newCustomerPhone.trim() || undefined);
    if (result.success && result.id) {
      setCustomerId(result.id);
      setCustomerName(result.name || newCustomerName);
      setShowQuickAdd(false);
      setStep("items");
    }
  }

  async function handleSubmit() {
    if (cart.length === 0) return;
    setSaving(true);
    setError("");

    const data: CreateOrderData = {
      customer_id: customerId || undefined,
      customer_name: customerName || "Venta directa",
      source,
      delivery_date: new Date().toISOString().split("T")[0],
      daily_menu_id: dailyMenu?.id || undefined,
      items: cart.map((c) => ({
        menu_item_id: c.menu_item_id,
        item_name_es: c.name_es,
        price: c.price,
        quantity: c.quantity,
      })),
    };

    const result = await createOrder(data);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isWalkUp ? t("walkUpSale") : t("newOrder")}>
      {/* Step: Customer */}
      {step === "customer" && (
        <div className="space-y-4">
          {/* Source */}
          <FormField label={t("source")} id="source">
            <div className="flex gap-2 flex-wrap">
              {ORDER_SOURCES.filter((s) => s !== "walk_in").map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={`px-4 py-2 rounded-full text-sm font-medium touch-target ${
                    source === s
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {t(`sources.${s}` as "sources.phone")}
                </button>
              ))}
            </div>
          </FormField>

          {/* Customer search */}
          <FormField label={t("selectCustomer")} id="customer_search">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <Input
                id="customer_search"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder={`${tCommon("search")}...`}
                className="pl-10"
              />
            </div>
          </FormField>

          {/* Customer list */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredCustomers.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCustomer(c)}
                className="w-full text-left p-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)]
                           transition-colors touch-target"
              >
                <span className="font-medium">{c.name}</span>
                {c.phone && (
                  <span className="text-sm text-[var(--muted-foreground)] ml-2">
                    {c.phone}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick add new customer */}
          {!showQuickAdd ? (
            <button
              onClick={() => setShowQuickAdd(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                         border border-dashed border-[var(--border)]
                         text-[var(--muted-foreground)] hover:border-[var(--primary)]
                         touch-target"
            >
              <UserPlus size={18} />
              {t("quickAdd")}
            </button>
          ) : (
            <div className="space-y-3 p-3 rounded-xl bg-[var(--muted)]">
              <Input
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder={tCommon("name")}
              />
              <Input
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                placeholder={tCommon("phone")}
                type="tel"
              />
              <Button
                type="button"
                variant="primary"
                onClick={handleQuickAdd}
                disabled={!newCustomerName.trim()}
                className="w-full"
              >
                {tCommon("add")}
              </Button>
            </div>
          )}

          {/* Skip customer (anonymous) */}
          <button
            onClick={() => { setCustomerName(""); setStep("items"); }}
            className="w-full text-center text-sm text-[var(--muted-foreground)] py-2"
          >
            Continuar sin cliente →
          </button>
        </div>
      )}

      {/* Step: Items */}
      {step === "items" && (
        <div className="space-y-4">
          {/* Customer name (if selected) */}
          {customerName && (
            <p className="text-sm text-[var(--muted-foreground)]">
              👤 {customerName}
              {!isWalkUp && (
                <button onClick={() => setStep("customer")} className="ml-2 text-[var(--primary)]">
                  ({tCommon("edit")})
                </button>
              )}
            </p>
          )}

          {/* Menu items grid */}
          <div className="space-y-2">
            {availableItems.map((item) => {
              const inCart = cart.find((c) => c.menu_item_id === item.id);
              const name = locale === "en" && item.name_en ? item.name_en : item.name_es;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--muted)]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{name}</p>
                    <p className="text-sm text-[var(--primary)] font-bold">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  {inCart ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateCartQuantity(item.id, inCart.quantity - 1)}
                        className="w-10 h-10 rounded-xl bg-[var(--card)] flex items-center justify-center touch-target"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-bold">{inCart.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, inCart.quantity + 1)}
                        className="w-10 h-10 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center touch-target"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="w-10 h-10 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center touch-target"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {availableItems.length === 0 && (
            <p className="text-center text-[var(--muted-foreground)] py-8">
              No hay platillos disponibles
            </p>
          )}

          {/* Cart summary sticky footer */}
          {cart.length > 0 && (
            <div className="sticky bottom-0 bg-[var(--background)] pt-3 border-t border-[var(--border)]">
              <Button
                type="button"
                variant="primary"
                onClick={() => setStep("review")}
                className="w-full flex items-center justify-between"
              >
                <span>{t("review")} ({cartItemCount})</span>
                <span className="text-stat">{formatCurrency(cartTotal)}</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step: Review */}
      {step === "review" && (
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-[var(--muted)] rounded-xl p-3">
            <p className="text-xs text-[var(--muted-foreground)]">
              {t("source")}: {t(`sources.${source}` as "sources.phone")}
            </p>
            <p className="font-medium">{customerName || "Sin cliente"}</p>
          </div>

          {/* Cart items */}
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.menu_item_id} className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium">{item.quantity}x</span>{" "}
                  <span className="text-sm">{item.name_es}</span>
                </div>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-[var(--border)] pt-3 flex justify-between">
            <span className="font-bold">{tCommon("total")}</span>
            <span className="text-display text-[var(--primary)]">{formatCurrency(cartTotal)}</span>
          </div>

          {error && (
            <p className="text-sm text-[var(--danger)] bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep("items")}
              className="flex-1"
            >
              {tCommon("back")}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={saving || cart.length === 0}
              className="flex-1"
            >
              {saving ? tCommon("loading") : t("createOrder")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
