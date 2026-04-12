"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

interface RecentItem {
  id: string;
  title: string;
  price: string | number | null;
  priceType: string;
  images: { url: string; thumbnailUrl: string | null }[];
}

export default function RecentlyViewed() {
  const { user } = useAppStore();
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchRecent() {
      try {
        const res = await fetch("/api/recently-viewed");
        if (!res.ok) return;
        const data = await res.json();
        setItems(data);
      } catch {
        // Ignore errors
      } finally {
        setLoading(false);
      }
    }

    fetchRecent();
  }, [user]);

  if (!user || loading || items.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          Recently Viewed
        </h2>
        <Link
          href="/dashboard/recently-viewed"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {items.map((item) => {
          const imageUrl =
            item.images[0]?.thumbnailUrl || item.images[0]?.url || null;
          const priceDisplay =
            item.priceType === "FREE"
              ? "Free"
              : item.priceType === "CONTACT"
                ? "Contact"
                : formatPrice(item.price);

          return (
            <Link
              key={item.id}
              href={`/listings/${item.id}`}
              className="flex-shrink-0 w-36 group"
            >
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                      📦
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition">
                    {item.title}
                  </h3>
                  <p className="text-sm font-bold text-blue-600 mt-1">
                    {priceDisplay}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
