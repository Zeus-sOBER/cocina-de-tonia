import { getEvents } from "@/lib/actions/events";
import { getCustomers } from "@/lib/actions/customers";
import { EventsPageClient } from "./events-page-client";

export default async function EventsPage() {
  const [events, customers] = await Promise.all([
    getEvents(),
    getCustomers(),
  ]);
  return <EventsPageClient initialEvents={events} customers={customers} />;
}
