export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_SOURCES = [
  "facebook",
  "whatsapp",
  "phone",
  "walk_in",
] as const;
export type OrderSource = (typeof ORDER_SOURCES)[number];

export const ORDER_TYPES = ["daily", "event"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const PAYMENT_STATUSES = ["unpaid", "partial", "paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ["cash", "transfer", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const DAILY_MENU_STATUSES = ["draft", "announced", "closed"] as const;
export type DailyMenuStatus = (typeof DAILY_MENU_STATUSES)[number];

export const EVENT_STATUSES = [
  "inquiry",
  "quoted",
  "confirmed",
  "completed",
  "cancelled",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const INGREDIENT_CATEGORIES = [
  "produce",
  "meat",
  "dairy",
  "dry_goods",
  "spices",
  "other",
] as const;
export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

export const UNITS = [
  "kg",
  "lb",
  "piece",
  "liter",
  "dozen",
  "bag",
  "can",
  "box",
] as const;
export type Unit = (typeof UNITS)[number];

// Status flow: what status can transition to what
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivered"],
  delivered: [],
  cancelled: [],
};

// Status colors for UI
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  preparing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  ready: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  delivered: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};
