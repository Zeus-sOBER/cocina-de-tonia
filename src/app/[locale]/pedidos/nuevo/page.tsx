import { redirect } from "next/navigation";

// New orders are created via the modal on /pedidos
export default function NewOrderPage() {
  redirect("/es/pedidos");
}
