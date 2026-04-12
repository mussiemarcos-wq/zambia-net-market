"use client";

import { useEffect, useState } from "react";
import { Funnel } from "lucide-react";
import { cn } from "@/lib/utils";

interface FunnelSummary {
  views: number;
  clicks: number;
  favourites: number;
  conversionRate: number;
  favouriteRate: number;
}

interface FunnelData {
  summary: FunnelSummary;
  listings: {
    id: string;
    title: string;
    views: number;
    clicks: number;
    favourites: number;
    conversionRate: number;
  }[];
}

export default function ConversionFunnel() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/funnel")
      .then((r) => r.json())
      .then((d) => {
        if (d.summary) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 rounded w-40" />
          <div className="space-y-3">
            <div className="h-10 bg-gray-100 rounded" />
            <div className="h-10 bg-gray-100 rounded w-3/4 mx-auto" />
            <div className="h-10 bg-gray-100 rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary } = data;
  const viewsPct = 100;
  const savedPct = summary.views > 0
    ? Math.round((summary.favourites / summary.views) * 1000) / 10
    : 0;
  const enquiriesPct = summary.conversionRate;

  function getConversionMessage(rate: number) {
    if (rate > 8)
      return {
        text: "Excellent - your listings are performing well",
        color: "text-green-600",
      };
    if (rate >= 3)
      return { text: "Good - you're on track", color: "text-blue-600" };
    return {
      text: "Below average - try improving your listings",
      color: "text-orange-600",
    };
  }

  const msg = getConversionMessage(summary.conversionRate);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Funnel className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Conversion Funnel</h3>
      </div>

      {/* Funnel bars */}
      <div className="space-y-2 mb-5">
        {/* Views - widest */}
        <div className="flex flex-col items-center">
          <div className="w-full bg-blue-500 rounded-lg py-2.5 px-4 text-white text-sm font-medium flex items-center justify-between">
            <span>Views</span>
            <span>
              {summary.views.toLocaleString()} ({viewsPct}%)
            </span>
          </div>
        </div>

        {/* Saved - medium */}
        <div className="flex flex-col items-center">
          <div className="w-[75%] bg-blue-600 rounded-lg py-2.5 px-4 text-white text-sm font-medium flex items-center justify-between">
            <span>Saved</span>
            <span>
              {summary.favourites.toLocaleString()} ({savedPct}%)
            </span>
          </div>
        </div>

        {/* Enquiries - narrowest */}
        <div className="flex flex-col items-center">
          <div className="w-[50%] bg-blue-800 rounded-lg py-2.5 px-4 text-white text-sm font-medium flex items-center justify-between">
            <span>Enquiries</span>
            <span>
              {summary.clicks.toLocaleString()} ({enquiriesPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Conversion rate message */}
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-sm text-gray-700">
          Your conversion rate:{" "}
          <span className="font-bold">{summary.conversionRate}%</span>
        </p>
        <p className={cn("text-xs mt-1", msg.color)}>{msg.text}</p>
      </div>
    </div>
  );
}
