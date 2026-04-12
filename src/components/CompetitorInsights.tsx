"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, TrendingUp, Camera, Lightbulb } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

interface CompetitorData {
  competitorCount: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  yourPrice: number;
  pricePosition: string;
  percentile: number;
  avgViews: number;
  yourViews: number;
  avgPhotos: number;
  yourPhotos: number;
  tips: string[];
}

export default function CompetitorInsights({
  listingId,
}: {
  listingId: string;
}) {
  const [data, setData] = useState<CompetitorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics/competitors?listingId=${listingId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listingId]);

  if (loading) {
    return (
      <div className="animate-pulse bg-blue-50/50 border border-blue-100 rounded-lg p-4 mt-2">
        <div className="h-4 bg-blue-100 rounded w-48 mb-3" />
        <div className="h-20 bg-blue-100 rounded" />
      </div>
    );
  }

  if (!data) return null;

  const priceRange = data.maxPrice - data.minPrice || 1;
  const yourPosition =
    data.maxPrice > data.minPrice
      ? ((data.yourPrice - data.minPrice) / priceRange) * 100
      : 50;

  return (
    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">
            {data.competitorCount} competing listing
            {data.competitorCount !== 1 ? "s" : ""} in this category
          </span>
        </div>
        <Link
          href={`/listings/${listingId}/edit`}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          Edit Listing
        </Link>
      </div>

      {/* Price comparison bar */}
      {data.competitorCount > 0 && data.yourPrice > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1.5">Price position</p>
          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"
                style={{ left: `${Math.max(2, Math.min(98, yourPosition))}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-gray-400">
              <span>{formatPrice(data.minPrice)}</span>
              <span className="text-blue-600 font-medium">
                You: {formatPrice(data.yourPrice)}
              </span>
              <span>{formatPrice(data.maxPrice)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Performance comparison */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">Views</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {data.yourViews}
            </span>
            <span className="text-xs text-gray-400">
              vs {data.avgViews} avg
            </span>
          </div>
          <div
            className={cn(
              "text-xs mt-0.5 font-medium",
              data.yourViews >= data.avgViews
                ? "text-green-600"
                : "text-orange-600"
            )}
          >
            {data.yourViews >= data.avgViews ? "Above average" : "Below average"}
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Camera className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">Photos</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {data.yourPhotos}
            </span>
            <span className="text-xs text-gray-400">
              vs {data.avgPhotos} avg
            </span>
          </div>
          <div
            className={cn(
              "text-xs mt-0.5 font-medium",
              data.yourPhotos >= data.avgPhotos
                ? "text-green-600"
                : "text-orange-600"
            )}
          >
            {data.yourPhotos >= data.avgPhotos
              ? "Above average"
              : "Below average"}
          </div>
        </div>
      </div>

      {/* Tips */}
      {data.tips.length > 0 && (
        <div className="space-y-2">
          {data.tips.map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-gray-700"
            >
              <Lightbulb className="w-3.5 h-3.5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
