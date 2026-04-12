"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SPONSORED_CATEGORY_PLANS, CATEGORIES_WITH_SUBS } from "@/lib/constants";

interface User {
  id: string;
  name: string;
  role: string;
}

interface Sponsorship {
  id: string;
  placement: string;
  startDate: string;
  endDate: string;
  businessName: string;
}

export default function SponsorshipsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);

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
      setUser(userData.user || userData);

      // Fetch all sponsorships to show user's active/past ones
      const sponsorRes = await fetch("/api/sponsorships");
      if (sponsorRes.ok) {
        const sponsorData = await sponsorRes.json();
        setSponsorships(sponsorData.sponsorships || []);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(planId: string) {
    if (planId !== "sponsor_homepage" && !selectedCategory) {
      setMessage({ type: "error", text: "Please select a category to sponsor" });
      return;
    }

    try {
      const res = await fetch("/api/sponsorships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          categorySlug: planId === "sponsor_homepage" ? undefined : selectedCategory,
        }),
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

  function getPlacementLabel(placement: string): string {
    if (placement === "sponsor_homepage") return "Homepage";
    const slug = placement.replace("sponsor_", "");
    const cat = CATEGORIES_WITH_SUBS.find((c) => c.slug === slug);
    return cat ? cat.name : slug;
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
        <h1 className="text-2xl font-bold text-gray-900">Sponsor a Category</h1>
        <p className="text-sm text-gray-500 mt-1">
          Get your brand seen by every visitor browsing a category. Your logo and business name will appear at the top of all results.
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

      {/* Category Selector */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Select Category</h2>
        <p className="text-sm text-gray-500 mb-4">
          Choose which category you would like to sponsor. Homepage sponsorship applies site-wide.
        </p>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a category --</option>
          {CATEGORIES_WITH_SUBS.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </section>

      {/* Sponsorship Plans */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Sponsorship Plans</h2>
        <p className="text-gray-600 text-sm mb-6">
          Choose a plan to promote your brand to thousands of buyers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SPONSORED_CATEGORY_PLANS.map((plan, index) => (
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
                  Best Value
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">K{plan.price.toLocaleString()}</span>
                <span className="text-sm text-gray-500">/{plan.days} days</span>
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
                onClick={() => handlePurchase(plan.id)}
                className={`mt-6 w-full px-4 py-2.5 rounded-lg font-medium text-sm transition ${
                  index === 1
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                Purchase Sponsorship
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Active / Past Sponsorships */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Sponsorships</h2>

        {sponsorships.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Placement</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Business</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Start Date</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">End Date</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {sponsorships.map((s) => {
                  const isActive = new Date(s.endDate) >= new Date();
                  return (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium text-gray-900">
                        {getPlacementLabel(s.placement)}
                      </td>
                      <td className="py-3 px-2 text-gray-600">{s.businessName}</td>
                      <td className="py-3 px-2 text-gray-600">
                        {new Date(s.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {new Date(s.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isActive ? "Active" : "Expired"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">You have no sponsorships yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
