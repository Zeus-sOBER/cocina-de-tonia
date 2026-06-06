import { getIngredients } from "@/lib/actions/ingredients";
import { InventoryPageClient } from "./inventory-page-client";

export default async function InventoryPage() {
  const ingredients = await getIngredients();
  return <InventoryPageClient initialIngredients={ingredients} />;
}
