"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, ArrowLeft, CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react";
import DashboardAuthPrompt from "@/components/DashboardAuthPrompt";

interface Payment {
  id: string;
  type: string;
  amount: string | number;
  currency: string;
  status: string;
  provider: string | null;
  providerRef: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

interface PaymentsResponse {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const STATUS_STYLES: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  COMPLETED: { label: "Completed", color: "text-green-700 bg-green-100", icon: CheckCircle2 },
  PENDING: { label: "Pending", color: "text-yellow-700 bg-yellow-100", icon: Clock },
  FAILED: { label: "Failed", color: "text-red-700 bg-red-100", icon: XCircle },
  REFUNDED: { label: "Refunded", color: "text-gray-700 bg-gray-100", icon: RefreshCw },
};

const TYPE_LABELS: Record<string, string> = {
  BOOST: "Listing Boost",
  FEATURE: "Featured Listing",
  SUBSCRIPTION: "Subscription",
  VERIFICATION: "Verification Badge",
  BANNER: "Banner Ad",
};

export default function PaymentHistoryPage() {
  const [data, setData] = useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      try {
        const res = await fetch(`/api/payments/history?page=${page}&limit=20`, {
          cache: "no-store",
        });
        if (res.status === 401) {
          setNeedsAuth(true);
          return;
        }
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        setData(json);
      } catch {
        // leave empty, empty state will show
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, [page]);

  if (needsAuth) return <DashboardAuthPrompt />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-orange-500" />
            Payment History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            All your payments for boosts, features, and subscriptions
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      ) : !data || data.payments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No payments yet
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Your payment records for boosts, featured listings, and subscriptions
            will appear here.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.payments.map((p) => {
                    const statusStyle = STATUS_STYLES[p.status] || STATUS_STYLES.PENDING;
                    const StatusIcon = statusStyle.icon;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">
                          {new Date(p.createdAt).toLocaleDateString("en-ZM", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {TYPE_LABELS[p.type] || p.type}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {p.currency === "ZMW" ? "K" : p.currency + " "}
                          {Number(p.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                          {p.providerRef ? p.providerRef.slice(0, 16) + "..." : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} payments
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.pagination.totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
