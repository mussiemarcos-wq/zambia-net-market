import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import TelegramClient from "./TelegramClient";

export default async function TelegramAdminPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  return <TelegramClient />;
}
