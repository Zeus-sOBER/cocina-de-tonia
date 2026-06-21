"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { UtensilsCrossed, Plus, Tags, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { MenuItemForm } from "@/components/menu/menu-item-form";
import { CategoryManager } from "@/components/menu/category-manager";
import type { MenuItemWithCategory } from "@/lib/actions/menu";
import type { Category, Ingredient } from "@/lib/supabase/types";

type Props = {
  initialItems: MenuItemWithCategory[];
  categories: Category[];
  ingredients: Ingredient[];
};

export function MenuPageClient({ initialItems, categories, ingredients }: Props) {
  const locale = useLocale();
  const t = useTranslations("menu");
  const tCommon = useTranslations("common");

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MenuItemWithCategory | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter items
  const filteredItems = initialItems.filter((item) => {
    // Category filter
    if (filterCategory && item.category_id !== filterCategory) return false;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchEs = item.name_es.toLowerCase().includes(query);
      const matchEn = item.name_en?.toLowerCase().includes(query);
      if (!matchEs && !matchEn) return false;
    }

    return true;
  });

  function handleEdit(item: MenuItemWithCategory) {
    setEditItem(item);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditItem(null);
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                     bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold
                     touch-target-lg"
        >
          <Plus size={20} />
          {t("addItem")}
        </button>
        <button
          onClick={() => setShowCategories(true)}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl
                     bg-[var(--muted)] text-[var(--foreground)] font-medium
                     touch-target-lg"
        >
          <Tags size={20} />
          {t("categories")}
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`${tCommon("search")}...`}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)]
                     bg-[var(--card)] text-[var(--foreground)] text-base
                     focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
                     placeholder:text-[var(--muted-foreground)] touch-target"
        />
      </div>

      {/* Category filter pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <button
            onClick={() => setFilterCategory(null)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap touch-target",
              filterCategory === null
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            )}
          >
            {t("categories")}: {tCommon("all") || "Todos"}
          </button>
          {categories.map((cat) => {
            const name =
              locale === "en" && cat.name_en ? cat.name_en : cat.name_es;
            return (
              <button
                key={cat.id}
                onClick={() =>
                  setFilterCategory(filterCategory === cat.id ? null : cat.id)
                }
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap touch-target",
                  filterCategory === cat.id
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      {/* Menu items list */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <MenuItemCard key={item.id} item={item} onEdit={handleEdit} />
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <UtensilsCrossed
            size={48}
            className="text-[var(--muted-foreground)] mb-3"
          />
          <p className="text-[var(--muted-foreground)]">
            {searchQuery || filterCategory ? tCommon("noResults") : t("noItems")}
          </p>
        </div>
      )}

      {/* Item count */}
      {filteredItems.length > 0 && (
        <p className="text-center text-sm text-[var(--muted-foreground)]">
          {filteredItems.length} {filteredItems.length === 1 ? "platillo" : "platillos"}
        </p>
      )}

      {/* Menu item form modal */}
      <MenuItemForm
        open={showForm}
        onClose={handleCloseForm}
        editItem={editItem}
        categories={categories}
        ingredients={ingredients}
      />

      {/* Category manager modal */}
      <CategoryManager
        open={showCategories}
        onClose={() => setShowCategories(false)}
        categories={categories}
      />
    </div>
  );
}
