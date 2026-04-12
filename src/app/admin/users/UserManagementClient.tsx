"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Shield,
  ShieldCheck,
  Ban,
  CheckCircle,
  XCircle,
  Users,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ExportButton from "@/components/ExportButton";

interface UserRecord {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  location: string | null;
  listingsCount: number;
}

interface Stats {
  totalUsers: number;
  verifiedUsers: number;
  bannedUsers: number;
  newThisWeek: number;
}

interface ApiResponse {
  users: UserRecord[];
  total: number;
  page: number;
  totalPages: number;
  stats: Stats;
}

const ROLES = ["All", "MEMBER", "SELLER", "BUSINESS", "ADMIN"] as const;

const ROLE_COLORS: Record<string, string> = {
  MEMBER: "bg-gray-100 text-gray-700",
  SELLER: "bg-blue-100 text-blue-700",
  BUSINESS: "bg-purple-100 text-purple-700",
  ADMIN: "bg-orange-100 text-orange-700",
  SUPER_ADMIN: "bg-red-100 text-red-700",
};

const ASSIGNABLE_ROLES = ["MEMBER", "SELLER", "BUSINESS", "ADMIN"];

export default function UserManagementClient() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    verifiedUsers: 0,
    bannedUsers: 0,
    newThisWeek: 0,
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [processingUser, setProcessingUser] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (search) params.set("search", search);
      if (roleFilter !== "All") params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: ApiResponse = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setStats(data.stats);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setProcessingUser(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update role");
      }
    } finally {
      setProcessingUser(null);
    }
  }

  async function handleToggleBan(userId: string, currentlyBanned: boolean) {
    const action = currentlyBanned ? "unban" : "ban";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    setProcessingUser(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !currentlyBanned }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, isBanned: !currentlyBanned } : u
          )
        );
      }
    } finally {
      setProcessingUser(null);
    }
  }

  async function handleToggleVerified(
    userId: string,
    currentlyVerified: boolean
  ) {
    setProcessingUser(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !currentlyVerified }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, isVerified: !currentlyVerified }
              : u
          )
        );
      }
    } finally {
      setProcessingUser(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-5 h-5 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Verified Users"
          value={stats.verifiedUsers}
          icon={<ShieldCheck className="w-5 h-5 text-green-600" />}
          bgColor="bg-green-50"
        />
        <StatCard
          label="Banned Users"
          value={stats.bannedUsers}
          icon={<Ban className="w-5 h-5 text-red-600" />}
          bgColor="bg-red-50"
          highlight={stats.bannedUsers > 0}
        />
        <StatCard
          label="New This Week"
          value={stats.newThisWeek}
          icon={<UserPlus className="w-5 h-5 text-purple-600" />}
          bgColor="bg-purple-50"
        />
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, phone, or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r === "All" ? "All Roles" : r}
              </option>
            ))}
          </select>
          <ExportButton type="users" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-900">Users</h2>
            <span className="text-sm text-gray-500">({total})</span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Listings</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const isProcessing = processingUser === u.id;
                  return (
                    <tr
                      key={u.id}
                      className={cn(
                        "hover:bg-gray-50/50 transition",
                        isProcessing && "opacity-50 pointer-events-none",
                        u.isBanned && "bg-red-50/30"
                      )}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {u.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.phone}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {u.email || (
                          <span className="text-gray-400 italic">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                            ROLE_COLORS[u.role] || "bg-gray-100 text-gray-700"
                          )}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.isVerified ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.isBanned ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {u.location || "--"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-center">
                        {u.listingsCount}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleRoleChange(u.id, e.target.value)
                            }
                            disabled={u.role === "SUPER_ADMIN"}
                            className="text-xs border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {ASSIGNABLE_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                            {u.role === "SUPER_ADMIN" && (
                              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            )}
                          </select>
                          <button
                            onClick={() =>
                              handleToggleBan(u.id, u.isBanned)
                            }
                            disabled={u.role === "SUPER_ADMIN"}
                            className={cn(
                              "p-1.5 rounded-lg transition",
                              u.isBanned
                                ? "text-green-600 hover:bg-green-50"
                                : "text-red-600 hover:bg-red-50",
                              u.role === "SUPER_ADMIN" &&
                                "opacity-50 cursor-not-allowed"
                            )}
                            title={u.isBanned ? "Unban" : "Ban"}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleVerified(u.id, u.isVerified)
                            }
                            className={cn(
                              "p-1.5 rounded-lg transition",
                              u.isVerified
                                ? "text-yellow-600 hover:bg-yellow-50"
                                : "text-green-600 hover:bg-green-50"
                            )}
                            title={
                              u.isVerified
                                ? "Remove Verification"
                                : "Verify User"
                            }
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  bgColor,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-xl border p-4 ${
        highlight ? "border-red-300" : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
