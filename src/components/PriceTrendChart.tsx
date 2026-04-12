"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

interface WeekData {
  week: string;
  avgPrice: number;
  listingCount: number;
}

interface PriceHistoryData {
  category: string;
  categorySlug: string;
  weeks: WeekData[];
  stats: {
    min: number;
    max: number;
    average: number;
    currentAverage: number;
  };
}

export default function PriceTrendChart({
  categorySlug,
}: {
  categorySlug: string;
}) {
  const [data, setData] = useState<PriceHistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categorySlug) return;
    setLoading(true);
    fetch(`/api/insights/price-history?categorySlug=${categorySlug}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Trends</h3>
        <div className="animate-pulse space-y-2">
          <div className="flex items-end gap-1 h-40">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gray-200 rounded-t"
                style={{ height: `${30 + Math.random() * 70}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.weeks) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Trends</h3>
        <p className="text-sm text-gray-500">No price data available for this category.</p>
      </div>
    );
  }

  const maxPrice = Math.max(...data.weeks.map((w) => w.avgPrice), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Price Trends - {data.category}
        </h3>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Min</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatPrice(data.stats.min)}
          </p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Max</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatPrice(data.stats.max)}
          </p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">12-Week Avg</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatPrice(data.stats.average)}
          </p>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600">Current Avg</p>
          <p className="text-sm font-semibold text-blue-700">
            {formatPrice(data.stats.currentAverage)}
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1 h-40">
        {data.weeks.map((week) => {
          const height =
            maxPrice > 0 ? (week.avgPrice / maxPrice) * 100 : 0;
          return (
            <div
              key={week.week}
              className="flex-1 flex flex-col items-center group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                {week.week}: {formatPrice(week.avgPrice)} ({week.listingCount}{" "}
                listings)
              </div>
              <div
                className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-all cursor-pointer"
                style={{ height: `${Math.max(height, 2)}%` }}
              />
              <span className="text-[9px] text-gray-400 mt-1 truncate w-full text-center">
                {week.week.split("-W")[1] ? `W${week.week.split("-W")[1]}` : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
