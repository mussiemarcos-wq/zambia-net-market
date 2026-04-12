"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Loader2 } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

interface RecentListing {
  id: string;
  title: string;
  price: string | number | null;
  priceType: string;
  location: string | null;
  condition: string;
  isFeatured: boolean;
  isBoosted: boolean;
  viewsCount: number;
  createdAt: string;
  viewedAt: string;
  images: { url: string; thumbnailUrl: string | null }[];
  category: { name: string };
  user: {
    id: string;
    name: string;
    isVerified: boolean;
    avatarUrl: string | null;
  };
}

export default function RecentlyViewedPage() {
  const { user } = useAppStore();
  const router = useRouter();
  const [listings, setListings] = useState<RecentListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      router.push("/");
      return;
    }

    async function fetchRecent() {
      try {
        const res = await fetch("/api/recently-viewed");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setListings(data);
      } catch (err) {
        console.error("Error fetching recently viewed:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecent();
  }, [user, router]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recently Viewed</h1>
          <p className="text-sm text-gray-500 mt-1">
            Listings you have viewed recently
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {!loading && listings.length === 0 && (
        <div className="text-center py-20">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No viewing history
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            You haven&apos;t viewed any listings yet
          </p>
          <Link
            href="/search"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
          >
            Browse Listings
          </Link>
        </div>
      )}

      {!loading && listings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
