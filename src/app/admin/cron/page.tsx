import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import CronClient from "./CronClient";

export const metadata = {
  title: "Cron Jobs - Admin",
};

export default async function CronPage() {
  const user = await getCurrentUser().catch(() => null);

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2 dark:text-white">Cron Jobs</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Manage and manually trigger scheduled background tasks.
      </p>
      <CronClient />
    </div>
  );
}
