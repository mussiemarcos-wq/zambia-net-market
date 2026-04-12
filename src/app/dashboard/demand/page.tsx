"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Search, TrendingUp, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface DemandGap {
  query: string;
  searchCount: number;
  lastSearched: string;
}

interface HotSearch {
  query: string;
  searchCount: number;
  avgResults: number;
}

interface DemandData {
  demandGaps: DemandGap[];
  hotSearches: HotSearch[];
}

export default function DemandGapsPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [data, setData] = useState<DemandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    fetch("/api/analytics/demand-gaps")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((json) => {
        const result = json.demandGaps ? json : json.data ?? json;
        setData(result);
      })
      .catch(() => setError("Failed to load demand data"))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Sign in required</h1>
          <p className="text-gray-500">You need to be logged in to view demand insights.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const { demandGaps, hotSearches } = data!;

  function formatTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Demand Insights</h1>
        <p className="text-sm text-gray-500 mt-1">
          See what buyers are searching for and find opportunities to list in-demand items.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Demand Gaps - What Buyers Want */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">What Buyers Want</h2>
                <p className="text-xs text-gray-500">Searches with no results - list these items!</p>
              </div>
            </div>
          </div>

          {demandGaps.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400 text-sm">No unmet demand found yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {demandGaps.map((gap, i) => (
                <div
                  key={gap.query}
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-semibold text-gray-400 w-5 text-right flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        &ldquo;{gap.query}&rdquo;
                      </p>
                      <p className="text-xs text-gray-400">
                        {gap.searchCount} {gap.searchCount === 1 ? "search" : "searches"} &middot; {formatTimeAgo(gap.lastSearched)}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/listings/new?title=${encodeURIComponent(gap.query)}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition flex-shrink-0"
                  >
                    Post Listing
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hot Searches */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Hot Searches</h2>
                <p className="text-xs text-gray-500">Most popular searches with results</p>
              </div>
            </div>
          </div>

          {hotSearches.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400 text-sm">No search data available yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {hotSearches.map((item, i) => (
                <div
                  key={item.query}
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-semibold text-gray-400 w-5 text-right flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        &ldquo;{item.query}&rdquo;
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.searchCount} {item.searchCount === 1 ? "search" : "searches"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full flex-shrink-0">
                    ~{item.avgResults} results
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
