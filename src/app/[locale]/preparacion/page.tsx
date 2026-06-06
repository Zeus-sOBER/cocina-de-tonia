import { getPrepTasks } from "@/lib/actions/prep";
import { PrepPageClient } from "./prep-page-client";

export default async function PrepPage() {
  const tasks = await getPrepTasks();
  return <PrepPageClient initialTasks={tasks} />;
}
