"use client";

import { useEffect, useState } from "react";

interface TrendingItem {
  query: string;
  count: number;
}

export default function TrendingSearches() {
  const [data, setData] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights/market-trends")
      .then((res) => res.json())
      .then((json) => {
        setData(json.trendingSearches || []);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Searches</h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 rounded" />
              <div className="flex-1 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const maxCount = data.length > 0 ? data[0].count : 1;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Searches</h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-500">No search data available yet.</p>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item.query} className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 w-5 text-right">
                {index + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">
                    {item.query}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.count} searches
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(item.count / maxCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
