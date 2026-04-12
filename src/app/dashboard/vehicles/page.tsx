"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTO_DEALER_PLANS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  role: string;
  isVerified: boolean;
}

interface VehicleListing {
  id: string;
  title: string;
  price: string | null;
  location: string | null;
  status: string;
  viewsCount: number;
  whatsappClicks: number;
  createdAt: string;
  subcategory: { name: string } | null;
  images: { url: string; thumbnailUrl: string | null }[];
}

interface Stats {
  total: number;
  active: number;
  totalViews: number;
  totalEnquiries: number;
}

export default function VehicleDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, totalViews: 0, totalEnquiries: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) {
        router.push("/auth/login");
        return;
      }

      const userData = await userRes.json();
      const currentUser = userData.user || userData;
      setUser(currentUser);

      // Fetch user's vehicle listings
      const listingsRes = await fetch(`/api/listings?userId=${currentUser.id}&category=vehicles`);
      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        const items: VehicleListing[] = listingsData.listings || listingsData || [];
        setListings(items);

        const active = items.filter((l) => l.status === "ACTIVE").length;
        const totalViews = items.reduce((sum, l) => sum + (l.viewsCount || 0), 0);
        const totalEnquiries = items.reduce((sum, l) => sum + (l.whatsappClicks || 0), 0);

        setStats({
          total: items.length,
          active,
          totalViews,
          totalEnquiries,
        });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(planId: string) {
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "SUBSCRIPTION", planId }),
      });

      const data = await res.json();

      if (res.ok && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        setMessage({ type: "error", text: data.error || "Failed to initialize payment" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  }

  function getVehicleType(subcategory: { name: string } | null): string {
    if (!subcategory) return "Vehicle";
    const name = subcategory.name.toLowerCase();
    if (name.includes("car")) return "Car";
    if (name.includes("truck")) return "Truck";
    if (name.includes("motorcycle")) return "Motorcycle";
    if (name.includes("parts")) return "Parts";
    if (name.includes("equipment") || name.includes("machinery")) return "Equipment";
    return subcategory.name;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Dealer Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your vehicle inventory and grow your dealership business.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Auto Dealer Plans */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Auto Dealer Plans</h2>
        <p className="text-gray-600 text-sm mb-6">
          Choose a plan that fits your dealership size and start listing vehicles today.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AUTO_DEALER_PLANS.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative border rounded-xl p-6 flex flex-col ${
                index === 1
                  ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/30"
                  : "border-gray-200"
              }`}
            >
              {index === 1 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">K{plan.price.toLocaleString()}</span>
                <span className="text-sm text-gray-500">/month</span>
              </div>
              <ul className="mt-4 space-y-2 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                className={`mt-6 w-full px-4 py-2.5 rounded-lg font-medium text-sm transition ${
                  index === 1
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Your Inventory */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Inventory</h2>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Vehicles</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Views</p>
            <p className="text-2xl font-bold text-blue-700">{stats.totalViews.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Total Enquiries</p>
            <p className="text-2xl font-bold text-purple-700">{stats.totalEnquiries.toLocaleString()}</p>
          </div>
        </div>

        {/* Listings Table */}
        {listings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Vehicle</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Price</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Views</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Enquiries</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {listing.images[0] ? (
                            <img
                              src={listing.images[0].thumbnailUrl || listing.images[0].url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                              🚗
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{listing.title}</p>
                          {listing.location && (
                            <p className="text-xs text-gray-500 truncate">{listing.location}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getVehicleType(listing.subcategory)}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-medium text-gray-900">
                      {formatPrice(listing.price)}
                    </td>
                    <td className="py-3 px-2 text-gray-600">{listing.viewsCount}</td>
                    <td className="py-3 px-2 text-gray-600">{listing.whatsappClicks}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          listing.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : listing.status === "EXPIRED"
                              ? "bg-yellow-100 text-yellow-800"
                              : listing.status === "SOLD"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {listing.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-3">You have no vehicle listings yet.</p>
            <a
              href="/listings/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              List Your First Vehicle
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
