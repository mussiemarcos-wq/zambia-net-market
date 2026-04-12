"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { AlertTriangle, Info, ChevronDown, ChevronUp, X } from "lucide-react";

interface Suggestion {
  listingId: string;
  title: string;
  price: string | null;
  viewsCount: number;
  whatsappClicks: number;
  suggestion: string;
  severity: "warning" | "info";
}

const DISMISSED_KEY = "repost-reminders-dismissed";

export default function RepostReminders() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loweringId, setLoweringId] = useState<string | null>(null);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISSED_KEY);
    if (wasDismissed === "true") {
      setDismissed(true);
      setLoading(false);
      return;
    }

    fetch("/api/analytics/repost-suggestions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSuggestions(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "true");
  }

  async function handleLowerPrice(listingId: string, currentPrice: string | null) {
    if (!currentPrice) return;
    const price = parseFloat(currentPrice);
    if (isNaN(price)) return;

    const newPrice = Math.round(price * 0.9);
    setLoweringId(listingId);

    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: newPrice }),
      });

      if (res.ok) {
        setSuggestions((prev) =>
          prev.map((s) =>
            s.listingId === listingId
              ? { ...s, price: newPrice.toString(), suggestion: "Price lowered successfully!" }
              : s
          )
        );
      }
    } finally {
      setLoweringId(null);
    }
  }

  if (loading || dismissed || suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-amber-200 overflow-hidden mb-6">
      <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-amber-900">
            Listing Tips
          </h3>
          <span className="text-xs text-amber-600 font-medium">
            {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="divide-y divide-gray-100">
          {suggestions.map((s) => (
            <div
              key={s.listingId}
              className={cn(
                "px-4 py-3",
                s.severity === "warning" ? "bg-amber-50/50" : "bg-blue-50/50"
              )}
            >
              <div className="flex items-start gap-2">
                {s.severity === "warning" ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/listings/${s.listingId}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 transition line-clamp-1"
                  >
                    {s.title}
                  </Link>
                  <p className="text-xs text-gray-600 mt-1">{s.suggestion}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Link
                      href={`/listings/${s.listingId}/edit`}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition"
                    >
                      Edit Listing
                    </Link>
                    {s.price && (
                      <button
                        onClick={() => handleLowerPrice(s.listingId, s.price)}
                        disabled={loweringId === s.listingId}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition disabled:opacity-50"
                      >
                        {loweringId === s.listingId
                          ? "Lowering..."
                          : `Lower Price 10% (${formatPrice(Math.round(parseFloat(s.price) * 0.9))})`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
