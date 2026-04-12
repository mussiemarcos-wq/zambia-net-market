"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlot {
  day: string;
  hour: number;
  label: string;
  avgViews: number;
  avgClicks: number;
}

interface BestTimeData {
  bestSlots: TimeSlot[];
  worstSlots: TimeSlot[];
}

export default function BestTimeToPost() {
  const [data, setData] = useState<BestTimeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/best-time")
      .then((r) => r.json())
      .then((d) => {
        if (d.bestSlots) setData(d);
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.bestSlots.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Best Times to Post</h3>
        </div>
        <p className="text-sm text-gray-500">
          Not enough data yet. Check back later.
        </p>
      </div>
    );
  }

  const maxViews = data.bestSlots[0]?.avgViews || 1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Best Times to Post</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Listings posted at these times get the most views
      </p>

      {/* Best slots */}
      <div className="space-y-2 mb-5">
        {data.bestSlots.map((slot, i) => {
          const intensity = slot.avgViews / maxViews;
          return (
            <div
              key={slot.label}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg border",
                i === 0
                  ? "bg-green-50 border-green-200"
                  : i === 1
                    ? "bg-green-50/60 border-green-100"
                    : "bg-gray-50 border-gray-100"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    i === 0
                      ? "bg-green-600 text-white"
                      : i === 1
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-700"
                  )}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {slot.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>{slot.avgViews} avg views</span>
                <span>{slot.avgClicks} avg clicks</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Worst slots */}
      {data.worstSlots.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Avoid posting at
          </p>
          <div className="flex flex-wrap gap-2">
            {data.worstSlots.map((slot) => (
              <span
                key={slot.label}
                className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-500"
              >
                {slot.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
