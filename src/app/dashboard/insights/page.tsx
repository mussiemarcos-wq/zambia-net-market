"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DATA_INSIGHTS_PLANS, CATEGORIES_WITH_SUBS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import TrendingSearches from "@/components/TrendingSearches";
import PriceTrendChart from "@/components/PriceTrendChart";

interface CategoryBreakdown {
  name: string;
  slug: string;
  activeListings: number;
  avgPrice: number;
  newThisWeek: number;
}

interface SupplyGap {
  category: string;
  categorySlug: string;
  searchCount: number;
  listingCount: number;
  gap: number;
  ratio: string;
}

interface MarketData {
  categoryBreakdown: CategoryBreakdown[];
  supplyGaps: SupplyGap[];
}

export default function InsightsPage() {
  const router = useRouter();
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    CATEGORIES_WITH_SUBS[0]?.slug || ""
  );

  useEffect(() => {
    fetch("/api/insights/market-trends")
      .then((res) => {
        if (res.status === 401) {
          router.push("/");
          return null;
        }
        setAuthChecked(true);
        return res.json();
      })
      .then((json) => {
        if (json) setMarketData(json);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (!authChecked && loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-900">Market Intelligence</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Market Intelligence
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Real-time market data, pricing trends, and demand insights to help you
          make informed decisions.
        </p>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {DATA_INSIGHTS_PLANS.map((plan, index) => (
          <div
            key={plan.id}
            className={`border rounded-xl p-6 ${
              index === 1
                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                : "border-gray-200 bg-white"
            }`}
          >
            {index === 1 && (
              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                Most Popular
              </span>
            )}
            <h3 className="text-lg font-bold text-gray-900 mt-2">
              {plan.name}
            </h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatPrice(plan.price)}
              <span className="text-sm font-normal text-gray-500">/month</span>
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <svg
                    className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="mt-6 w-full py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
              Subscribe
            </button>
          </div>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trending Searches */}
        <TrendingSearches />

        {/* Category Overview */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Category Overview
          </h3>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium text-right">Active</th>
                    <th className="pb-2 font-medium text-right">Avg Price</th>
                    <th className="pb-2 font-medium text-right">New</th>
                  </tr>
                </thead>
                <tbody>
                  {(marketData?.categoryBreakdown || []).map((cat) => (
                    <tr
                      key={cat.slug}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-2 font-medium text-gray-800">
                        {cat.name}
                      </td>
                      <td className="py-2 text-right text-gray-600">
                        {cat.activeListings}
                      </td>
                      <td className="py-2 text-right text-gray-600">
                        {formatPrice(cat.avgPrice)}
                      </td>
                      <td className="py-2 text-right">
                        {cat.newThisWeek > 0 ? (
                          <span className="text-green-600 font-medium">
                            +{cat.newThisWeek}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Price Trends */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <label
            htmlFor="category-select"
            className="text-sm font-medium text-gray-700"
          >
            Select category for price trends:
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES_WITH_SUBS.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <PriceTrendChart categorySlug={selectedCategory} />
      </div>

      {/* Supply vs Demand */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Supply vs Demand
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Categories where search demand exceeds available listings -- potential
          opportunities.
        </p>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        ) : (marketData?.supplyGaps || []).length === 0 ? (
          <p className="text-sm text-gray-500">
            No significant supply gaps detected at this time.
          </p>
        ) : (
          <div className="space-y-3">
            {(marketData?.supplyGaps || []).map((gap) => (
              <div
                key={gap.categorySlug}
                className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {gap.category}
                  </p>
                  <p className="text-xs text-gray-500">
                    {gap.searchCount} searches vs {gap.listingCount} listings
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    {gap.ratio}x demand
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
