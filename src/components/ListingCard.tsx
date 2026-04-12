"use client";

import Link from "next/link";
import { Heart, MapPin, Clock, BadgeCheck, Zap } from "lucide-react";
import { formatPrice, timeAgo } from "@/lib/utils";
import { useState } from "react";
import { useAppStore } from "@/lib/store";

interface ListingCardProps {
  listing: {
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
    images: { url: string; thumbnailUrl: string | null }[];
    user: {
      id: string;
      name: string;
      isVerified: boolean;
      avatarUrl: string | null;
    };
    category: { name: string };
  };
  isFavourited?: boolean;
}

export default function ListingCard({
  listing,
  isFavourited: initialFav = false,
}: ListingCardProps) {
  const [isFav, setIsFav] = useState(initialFav);
  const { user, openAuthModal } = useAppStore();

  async function toggleFavourite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuthModal("login");
      return;
    }
    const method = isFav ? "DELETE" : "POST";
    const res = await fetch(`/api/favourites/${listing.id}`, { method });
    if (res.ok) setIsFav(!isFav);
  }

  const imageUrl =
    listing.images[0]?.thumbnailUrl || listing.images[0]?.url || null;

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">
                {listing.category?.name === "Property" ? "🏠" : "📦"}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {listing.isFeatured && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-0.5 rounded-full">
                Featured
              </span>
            )}
            {listing.isBoosted && (
              <span className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Zap className="w-3 h-3" /> Boosted
              </span>
            )}
          </div>

          {/* Favourite button */}
          <button
            onClick={toggleFavourite}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition"
          >
            <Heart
              className={`w-4 h-4 ${
                isFav ? "fill-red-500 text-red-500" : "text-gray-500"
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition">
              {listing.title}
            </h3>
          </div>

          <p className="text-lg font-bold text-blue-600 mt-1">
            {listing.priceType === "FREE"
              ? "Free"
              : listing.priceType === "CONTACT"
                ? "Contact"
                : formatPrice(listing.price)}
            {listing.priceType === "NEGOTIABLE" && (
              <span className="text-xs font-normal text-gray-500 ml-1">
                neg.
              </span>
            )}
          </p>

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {listing.location && (
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {listing.location}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {timeAgo(listing.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
            <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              {listing.user.avatarUrl ? (
                <img
                  src={listing.user.avatarUrl}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-gray-500">
                  {listing.user.name[0]}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-600 truncate">
              {listing.user.name}
            </span>
            {listing.user.isVerified && (
              <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
