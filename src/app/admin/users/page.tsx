import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import UserManagementClient from "./UserManagementClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User Management - Admin Panel",
};

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage users, roles, and permissions.
        </p>
      </div>
      <UserManagementClient />
    </div>
  );
}
