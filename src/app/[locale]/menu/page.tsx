import { getMenuItems } from "@/lib/actions/menu";
import { getCategories } from "@/lib/actions/categories";
import { getIngredients } from "@/lib/actions/ingredients";
import { MenuPageClient } from "./menu-page-client";

export default async function MenuPage() {
  const [menuItems, categories, ingredients] = await Promise.all([
    getMenuItems(),
    getCategories(),
    getIngredients(),
  ]);

  return (
    <MenuPageClient
      initialItems={menuItems}
      categories={categories}
      ingredients={ingredients}
    />
  );
}
