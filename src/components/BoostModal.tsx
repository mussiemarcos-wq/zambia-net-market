"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { BOOST_PLANS, FEATURE_PLANS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  mode: "boost" | "feature";
}

export default function BoostModal({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  mode,
}: BoostModalProps) {
  const plans = mode === "boost" ? BOOST_PLANS : FEATURE_PLANS;
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handlePay() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode === "boost" ? "BOOST" : "FEATURE",
          planId: selectedPlanId,
          listingId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment initialization failed");
      window.location.href = data.authorizationUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === "boost" ? "Boost Listing" : "Feature Listing"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
              {listingTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4">
            {mode === "boost"
              ? "Boosted listings appear higher in search results and category pages."
              : "Featured listings get a highlighted badge and appear in the featured section on the homepage."}
          </p>

          {/* Plan Cards */}
          <div className="space-y-3 mb-6">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-lg border-2 transition text-left",
                  selectedPlanId === plan.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div>
                  <p className="font-medium text-gray-900">{plan.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {plan.days} day{plan.days !== 1 ? "s" : ""} of{" "}
                    {mode === "boost" ? "boosted visibility" : "featured placement"}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-lg font-bold",
                    selectedPlanId === plan.id
                      ? "text-blue-600"
                      : "text-gray-900"
                  )}
                >
                  K{plan.price}
                </span>
              </button>
            ))}
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={loading}
            className={cn(
              "w-full py-3 rounded-lg font-medium text-white transition disabled:opacity-50",
              mode === "boost"
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-purple-600 hover:bg-purple-700"
            )}
          >
            {loading ? "Initializing payment..." : "Pay with Paystack"}
          </button>
        </div>
      </div>
    </div>
  );
}
