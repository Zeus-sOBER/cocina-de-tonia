// Placeholder for Supabase generated types
// Run: npx supabase gen types typescript --project-id <your-project-id> > src/lib/supabase/types.ts
// For now, we define the types manually based on our schema

export type Profile = {
  id: string;
  full_name: string;
  role: "owner" | "staff";
  phone: string | null;
  preferred_locale: "es" | "en";
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name_es: string;
  name_en: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type MenuItem = {
  id: string;
  category_id: string | null;
  name_es: string;
  name_en: string | null;
  description_es: string | null;
  description_en: string | null;
  price: number;
  cost_estimate: number | null;
  is_available: boolean;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Ingredient = {
  id: string;
  name_es: string;
  name_en: string | null;
  unit: string;
  category: string | null;
  current_stock: number;
  min_stock: number;
  cost_per_unit: number | null;
  supplier_note: string | null;
  created_at: string;
  updated_at: string;
};

export type MenuItemIngredient = {
  id: string;
  menu_item_id: string;
  ingredient_id: string;
  quantity: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  notes: string | null;
  favorite_items: string[];
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
};

export type DailyMenu = {
  id: string;
  date: string;
  status: "draft" | "announced" | "closed";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DailyMenuItem = {
  id: string;
  daily_menu_id: string;
  menu_item_id: string;
  quantity_available: number;
  quantity_ordered: number;
  menu_item?: MenuItem;
};

export type Order = {
  id: string;
  order_number: number;
  customer_id: string | null;
  customer_name: string;
  order_type: "daily" | "event";
  daily_menu_id: string | null;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
  source: string;
  delivery_date: string;
  delivery_time: string | null;
  delivery_notes: string | null;
  subtotal: number;
  discount: number;
  total: number;
  payment_status: "unpaid" | "partial" | "paid";
  payment_method: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name_es: string;
  price: number;
  quantity: number;
  subtotal: number;
  special_instructions: string | null;
  created_at: string;
};

export type Event = {
  id: string;
  client_id: string | null;
  event_date: string;
  guest_count: number | null;
  venue: string | null;
  status: "inquiry" | "quoted" | "confirmed" | "completed" | "cancelled";
  total_quote: number;
  notes: string | null;
  deposit_amount: number;
  deposit_paid: boolean;
  created_at: string;
  updated_at: string;
  customer?: Customer;
};

export type EventMenuItem = {
  id: string;
  event_id: string;
  menu_item_id: string;
  quantity: number;
  custom_price: number | null;
  menu_item?: MenuItem;
};

export type PrepTask = {
  id: string;
  date: string;
  menu_item_id: string | null;
  item_name_es: string;
  total_quantity: number;
  completed_quantity: number;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
};

export type ShoppingListItem = {
  id: string;
  date: string;
  ingredient_id: string | null;
  ingredient_name: string;
  needed_quantity: number;
  on_hand_quantity: number;
  to_buy_quantity: number;
  unit: string;
  category: string | null;
  estimated_cost: number | null;
  is_purchased: boolean;
  actual_cost: number | null;
  created_at: string;
};

export type DailySummary = {
  id: string;
  date: string;
  total_orders: number;
  total_revenue: number;
  total_cost: number;
  orders_by_source: Record<string, number>;
  top_items: Array<{ item: string; qty: number }>;
  created_at: string;
  updated_at: string;
};
