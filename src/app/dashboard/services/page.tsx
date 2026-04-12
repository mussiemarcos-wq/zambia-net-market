"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SERVICE_PROVIDER_PLANS, LEAD_FEE } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

interface Lead {
  id: string;
  listingTitle: string;
  buyerName: string;
  contactMethod: "whatsapp" | "telegram";
  status: "new" | "contacted" | "converted";
  createdAt: string;
}

interface LeadStats {
  totalThisMonth: number;
  totalAll: number;
  converted: number;
  conversionRate: number;
}

interface User {
  id: string;
  name: string;
}

export default function ServiceProviderDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({
    totalThisMonth: 0,
    totalAll: 0,
    converted: 0,
    conversionRate: 0,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

      const leadsRes = await fetch("/api/leads");
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(leadsData.leads || []);
        setStats(
          leadsData.stats || {
            totalThisMonth: 0,
            totalAll: 0,
            converted: 0,
            conversionRate: 0,
          }
        );
        if (leadsData.notificationsEnabled !== undefined) {
          setNotificationsEnabled(leadsData.notificationsEnabled);
        }
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
        setMessage({
          type: "error",
          text: data.error || "Failed to initialize payment",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  }

  async function handleToggleNotifications() {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    try {
      await fetch("/api/service-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadNotifications: newValue }),
      });
    } catch {
      setNotificationsEnabled(!newValue);
    }
  }

  async function handleUpdateLeadStatus(
    leadId: string,
    status: "new" | "contacted" | "converted"
  ) {
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status } : l))
        );
        // Recalculate stats
        const updatedLeads = leads.map((l) =>
          l.id === leadId ? { ...l, status } : l
        );
        const converted = updatedLeads.filter(
          (l) => l.status === "converted"
        ).length;
        setStats((prev) => ({
          ...prev,
          converted,
          conversionRate:
            updatedLeads.length > 0
              ? Math.round((converted / updatedLeads.length) * 100)
              : 0,
        }));
      }
    } catch {
      // silently fail
    }
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
        <h1 className="text-2xl font-bold text-gray-900">
          Service Provider Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your service plans, leads, and notifications.
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

      {/* Service Provider Plans */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Service Provider Plans</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Choose a plan to list your services and receive leads from potential
          clients. Lead fee: K{LEAD_FEE.price} per enquiry.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SERVICE_PROVIDER_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg p-5 flex flex-col ${
                plan.id === "service_pro"
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200"
              }`}
            >
              {plan.id === "service_pro" && (
                <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full mb-2 self-start">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {plan.name}
              </h3>
              <p className="text-3xl font-bold mt-1 text-gray-900">
                K{plan.price}
              </p>
              <p className="text-sm text-gray-500 mb-4">per month</p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span className="text-green-500 mt-0.5 flex-shrink-0">
                      &#10003;
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Lead Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm font-medium text-gray-500">
            Leads This Month
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {stats.totalThisMonth}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm font-medium text-gray-500">Total Leads</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {stats.totalAll}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm font-medium text-gray-500">
            Conversion Rate
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {stats.conversionRate}%
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {stats.converted} converted
          </p>
        </div>
      </section>

      {/* Lead Notifications Toggle */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Lead Notifications
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Get notified when someone enquires about your services.
            </p>
          </div>
          <button
            onClick={handleToggleNotifications}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationsEnabled ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationsEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Your Leads */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Leads</h2>

        {leads.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No leads yet</p>
            <p className="text-sm mt-1">
              Leads will appear here when potential clients contact you through
              your service listings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Buyer
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Listing
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-gray-900">
                      {lead.buyerName || "Anonymous"}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {lead.listingTitle}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          lead.contactMethod === "whatsapp"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {lead.contactMethod === "whatsapp"
                          ? "WhatsApp"
                          : "Telegram"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {timeAgo(new Date(lead.createdAt))}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleUpdateLeadStatus(
                            lead.id,
                            e.target.value as "new" | "contacted" | "converted"
                          )
                        }
                        className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${
                          lead.status === "new"
                            ? "bg-yellow-100 text-yellow-700"
                            : lead.status === "contacted"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
