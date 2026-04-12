"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ToggleLeft, ToggleRight, Plus } from "lucide-react";

interface Banner {
  id: string;
  title: string | null;
  imageUrl: string;
  targetUrl: string | null;
  placement: string;
  impressions: number;
  clicks: number;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
}

function getStatus(banner: Banner): "active" | "paused" | "expired" {
  if (!banner.isActive) return "paused";
  const now = new Date();
  if (new Date(banner.expiresAt) <= now) return "expired";
  if (new Date(banner.startsAt) > now) return "paused";
  return "active";
}

function StatusBadge({ status }: { status: "active" | "paused" | "expired" }) {
  const styles = {
    active: "bg-green-100 text-green-700",
    paused: "bg-gray-100 text-gray-600",
    expired: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function BannerAdminClient({ banners: initialBanners }: { banners: Banner[] }) {
  const router = useRouter();
  const [banners, setBanners] = useState(initialBanners);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    targetUrl: "",
    placement: "homepage",
    startsAt: "",
    expiresAt: "",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ title: "", imageUrl: "", targetUrl: "", placement: "homepage", startsAt: "", expiresAt: "" });
        setShowForm(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id: string, currentActive: boolean) {
    const res = await fetch(`/api/banners/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentActive }),
    });
    if (res.ok) {
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: !currentActive } : b))
      );
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "Create Banner"}
        </button>

        {showForm && (
          <form onSubmit={handleCreate} className="mt-4 bg-gray-50 rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
                <select
                  value={form.placement}
                  onChange={(e) => setForm({ ...form, placement: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="homepage">Homepage</option>
                  <option value="category">Category Page</option>
                  <option value="search">Search Page</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
                <input
                  type="url"
                  value={form.targetUrl}
                  onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Banner"}
            </button>
          </form>
        )}
      </div>

      {/* Banners Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="pb-3 font-medium">Title</th>
              <th className="pb-3 font-medium">Placement</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Impressions</th>
              <th className="pb-3 font-medium">Clicks</th>
              <th className="pb-3 font-medium">CTR</th>
              <th className="pb-3 font-medium">Dates</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {banners.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  No banners yet. Create one above.
                </td>
              </tr>
            )}
            {banners.map((banner) => {
              const status = getStatus(banner);
              const ctr = banner.impressions > 0
                ? ((banner.clicks / banner.impressions) * 100).toFixed(2)
                : "0.00";
              return (
                <tr key={banner.id} className="text-gray-700">
                  <td className="py-3 pr-4 font-medium">{banner.title}</td>
                  <td className="py-3 pr-4 capitalize">{banner.placement}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={status} />
                  </td>
                  <td className="py-3 pr-4">{banner.impressions.toLocaleString()}</td>
                  <td className="py-3 pr-4">{banner.clicks.toLocaleString()}</td>
                  <td className="py-3 pr-4">{ctr}%</td>
                  <td className="py-3 pr-4 text-xs text-gray-500">
                    {new Date(banner.startsAt).toLocaleDateString()} -{" "}
                    {new Date(banner.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(banner.id, banner.isActive)}
                        className="p-1 rounded hover:bg-gray-100 transition"
                        title={banner.isActive ? "Pause" : "Activate"}
                      >
                        {banner.isActive ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-1 rounded hover:bg-red-50 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
