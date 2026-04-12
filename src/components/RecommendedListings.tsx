"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/components/ListingCard";

interface RecommendedListing {
  id: string;
  title: string;
  price: number | null;
  priceType: string;
  location: string | null;
  condition: string;
  isFeatured: boolean;
  isBoosted: boolean;
  viewsCount: number;
  createdAt: string;
  images: { url: string; thumbnailUrl: string | null }[];
  user: { id: string; name: string; isVerified: boolean; avatarUrl: string | null };
  category: { name: string };
}

export default function RecommendedListings() {
  const [listings, setListings] = useState<RecommendedListing[]>([]);
  const [type, setType] = useState<"personalized" | "trending">("trending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recommendations")
      .then((res) => res.json())
      .then((data) => {
        setListings(data.listings || []);
        setType(data.type || "trending");
      })
      .catch(() => {
        setListings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="h-7 bg-gray-200 rounded w-56 mb-6 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-xl aspect-[3/4] animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="max-w-6xl mx-auto px-4 pb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {type === "personalized" ? "Recommended For You" : "Trending Now"}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
