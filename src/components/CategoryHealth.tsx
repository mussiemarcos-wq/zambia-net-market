"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, TrendingUp, TrendingDown, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryData {
  categoryName: string;
  slug: string;
  icon: string | null;
  activeListings: number;
  newThisWeek: number;
  weeklyViews: number;
  growthRate: number;
  demandScore: number;
  opportunity: "high" | "medium" | "low";
}

export default function CategoryHealth() {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/category-health")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 rounded w-48" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-2">
          <LayoutGrid className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">
            Category Opportunities
          </h3>
        </div>
        <p className="text-sm text-gray-500">No category data available yet.</p>
      </div>
    );
  }

  const demandBadge = (opp: "high" | "medium" | "low") => {
    if (opp === "high")
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600">
          <Flame className="w-3.5 h-3.5" />
          High
        </span>
      );
    if (opp === "medium")
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          Medium
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
        <span className="w-2 h-2 rounded-full bg-gray-300" />
        Low
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <LayoutGrid className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Category Opportunities</h3>
      </div>

      <div className="space-y-2">
        {data.map((cat) => (
          <div
            key={cat.slug}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition",
              cat.opportunity === "high"
                ? "border-green-200 bg-green-50/50"
                : "border-gray-100 bg-gray-50/30"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-lg flex-shrink-0">
                {cat.icon || "📁"}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {cat.categoryName}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{cat.activeListings} active</span>
                  <span className="flex items-center gap-0.5">
                    +{cat.newThisWeek} this week
                    {cat.growthRate > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : cat.growthRate < 0 ? (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    ) : null}
                    {cat.growthRate !== 0 && (
                      <span
                        className={cn(
                          cat.growthRate > 0
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {cat.growthRate > 0 ? "+" : ""}
                        {cat.growthRate}%
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {demandBadge(cat.opportunity)}
              {cat.opportunity === "high" && (
                <Link
                  href={`/listings/new?category=${cat.slug}`}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
                >
                  Post here
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
