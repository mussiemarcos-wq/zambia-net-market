"use client";

import Link from "next/link";
import { MapPin, BadgeCheck, BedDouble, Bath, Home, MessageCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PropertyCardProps {
  listing: {
    id: string;
    title: string;
    price: number | string | null;
    priceType: string;
    location: string | null;
    description: string | null;
    isFeatured: boolean;
    isBoosted: boolean;
    createdAt: string;
    images: { url: string; thumbnailUrl: string | null }[];
    subcategory?: { name: string } | null;
    user: {
      id: string;
      name: string;
      isVerified: boolean;
      avatarUrl: string | null;
      phone?: string | null;
    };
  };
}

function getPropertyTypeBadge(subcategory: { name: string } | null | undefined): {
  label: string;
  color: string;
} {
  if (!subcategory) return { label: "Property", color: "bg-gray-100 text-gray-700" };
  const name = subcategory.name.toLowerCase();
  if (name.includes("rental")) return { label: "Rental", color: "bg-emerald-100 text-emerald-700" };
  if (name.includes("sale")) return { label: "For Sale", color: "bg-blue-100 text-blue-700" };
  if (name.includes("land")) return { label: "Land", color: "bg-amber-100 text-amber-700" };
  if (name.includes("commercial")) return { label: "Commercial", color: "bg-purple-100 text-purple-700" };
  return { label: subcategory.name, color: "bg-gray-100 text-gray-700" };
}

function extractPropertyDetails(description: string | null): {
  bedrooms: number | null;
  bathrooms: number | null;
} {
  if (!description) return { bedrooms: null, bathrooms: null };
  const text = description.toLowerCase();

  let bedrooms: number | null = null;
  let bathrooms: number | null = null;

  const bedMatch = text.match(/(\d+)\s*(?:bed(?:room)?s?|br|bdr)/);
  if (bedMatch) bedrooms = parseInt(bedMatch[1]);

  const bathMatch = text.match(/(\d+)\s*(?:bath(?:room)?s?|ba)/);
  if (bathMatch) bathrooms = parseInt(bathMatch[1]);

  return { bedrooms, bathrooms };
}

export default function PropertyCard({ listing }: PropertyCardProps) {
  const imageUrl = listing.images[0]?.url || null;
  const badge = getPropertyTypeBadge(listing.subcategory);
  const details = extractPropertyDetails(listing.description);
  const initial = listing.user.name.charAt(0).toUpperCase();

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image - larger aspect ratio for property */}
        <div className="relative aspect-[16/10] bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Home className="w-16 h-16" />
            </div>
          )}

          {/* Property type badge */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={`${badge.color} text-xs font-semibold px-2.5 py-1 rounded-full`}>
              {badge.label}
            </span>
            {listing.isFeatured && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2.5 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-8">
            <p className="text-xl font-bold text-white">
              {listing.priceType === "FREE"
                ? "Free"
                : listing.priceType === "CONTACT"
                  ? "Contact for Price"
                  : formatPrice(listing.price)}
              {listing.priceType === "NEGOTIABLE" && (
                <span className="text-xs font-normal text-white/80 ml-1">neg.</span>
              )}
              {badge.label === "Rental" && (
                <span className="text-sm font-normal text-white/80">/month</span>
              )}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition">
            {listing.title}
          </h3>

          {/* Location */}
          {listing.location && (
            <div className="flex items-center gap-1 mt-1.5 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{listing.location}</span>
            </div>
          )}

          {/* Property details */}
          {(details.bedrooms !== null || details.bathrooms !== null) && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              {details.bedrooms !== null && (
                <span className="flex items-center gap-1">
                  <BedDouble className="w-4 h-4 text-gray-400" />
                  {details.bedrooms} {details.bedrooms === 1 ? "Bed" : "Beds"}
                </span>
              )}
              {details.bathrooms !== null && (
                <span className="flex items-center gap-1">
                  <Bath className="w-4 h-4 text-gray-400" />
                  {details.bathrooms} {details.bathrooms === 1 ? "Bath" : "Baths"}
                </span>
              )}
            </div>
          )}

          {/* Agent info */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {listing.user.avatarUrl ? (
                  <img
                    src={listing.user.avatarUrl}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-gray-500">{initial}</span>
                )}
              </div>
              <span className="text-sm text-gray-600 truncate">{listing.user.name}</span>
              {listing.user.isVerified && (
                <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (listing.user.phone) {
                  const cleanPhone = listing.user.phone.replace(/\D/g, "");
                  const msg = encodeURIComponent(
                    `Hi, I'm interested in your property: "${listing.title}" on Zambia.net Marketplace`
                  );
                  window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition flex-shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Contact Agent
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
