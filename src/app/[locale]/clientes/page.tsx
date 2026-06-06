import { getCustomers } from "@/lib/actions/customers";
import { CustomersPageClient } from "./customers-page-client";

export default async function CustomersPage() {
  const customers = await getCustomers();
  return <CustomersPageClient initialCustomers={customers} />;
}
