"use client";

import Link from "next/link";
import {
  MapPin,
  Clock,
  Eye,
  BadgeCheck,
  MessageCircle,
  Send,
  Banknote,
  Briefcase,
} from "lucide-react";
import { formatPrice, timeAgo } from "@/lib/utils";

interface JobListingCardProps {
  listing: {
    id: string;
    title: string;
    price: string | number | null;
    priceType: string;
    location: string | null;
    viewsCount: number;
    createdAt: string;
    description?: string | null;
    subcategory?: { name: string; slug: string } | null;
    user: {
      id: string;
      name: string;
      phone: string;
      isVerified: boolean;
      avatarUrl: string | null;
    };
    images?: { url: string; thumbnailUrl: string | null }[];
  };
}

export default function JobListingCard({ listing }: JobListingCardProps) {
  const jobType = listing.subcategory?.name || "Full-time";

  const jobTypeStyles: Record<string, string> = {
    "Full-time": "bg-green-100 text-green-800",
    "Part-time": "bg-blue-100 text-blue-800",
    Freelance: "bg-purple-100 text-purple-800",
    "Skilled Trades": "bg-orange-100 text-orange-800",
  };

  const typeStyle = jobTypeStyles[jobType] || "bg-gray-100 text-gray-700";

  function handleWhatsApp(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const phone = listing.user.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hi, I'm interested in the job: "${listing.title}" on Zambia.net Marketplace`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");

    // Track the click
    fetch(`/api/listings/${listing.id}/whatsapp`, { method: "POST" }).catch(
      () => {}
    );
  }

  function handleTelegram(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const phone = listing.user.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hi, I'm interested in the job: "${listing.title}" on Zambia.net Marketplace`
    );
    window.open(`https://t.me/+${phone}?text=${message}`, "_blank");
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link href={`/listings/${listing.id}`}>
              <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition line-clamp-2">
                {listing.title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1.5">
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
                <span className="text-sm text-gray-600">
                  {listing.user.name}
                </span>
                {listing.user.isVerified && (
                  <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${typeStyle}`}>
            {jobType}
          </span>
        </div>

        {/* Details Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-gray-500">
          {listing.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {listing.location}
            </span>
          )}
          {listing.price && (
            <span className="flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5" />
              {formatPrice(listing.price)}
              {listing.priceType === "NEGOTIABLE" && (
                <span className="text-xs text-gray-400">neg.</span>
              )}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" />
            {jobType}
          </span>
        </div>

        {/* Description snippet */}
        {listing.description && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
            {listing.description}
          </p>
        )}

        {/* Footer: meta + action buttons */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(listing.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {listing.viewsCount} views
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Apply via WhatsApp
            </button>
            <button
              onClick={handleTelegram}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition"
            >
              <Send className="w-3.5 h-3.5" />
              Telegram
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
