"use client";

import { Eye, Heart, MessageCircle } from "lucide-react";

interface SocialProofProps {
  viewsCount: number;
  favouritesCount: number;
  whatsappClicks: number;
  createdAt: string;
}

export default function SocialProof({
  viewsCount,
  favouritesCount,
  whatsappClicks,
  createdAt,
}: SocialProofProps) {
  const postedDate = new Date(createdAt);
  const now = new Date();
  const hoursAgo = (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60);
  const isNew = hoursAgo <= 24;
  const isJustPosted = hoursAgo <= 1;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      {/* Views */}
      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
        <Eye className="w-3.5 h-3.5 text-gray-400" />
        {viewsCount} {viewsCount === 1 ? "view" : "views"}
      </span>

      {/* Favourites */}
      {favouritesCount > 0 && (
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
          <Heart className="w-3.5 h-3.5 text-red-400" />
          {favouritesCount} saved
        </span>
      )}

      {/* WhatsApp enquiries */}
      {whatsappClicks > 0 && (
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
          <MessageCircle className="w-3.5 h-3.5 text-green-500" />
          {whatsappClicks} {whatsappClicks === 1 ? "enquiry" : "enquiries"}
        </span>
      )}

      {/* New / Just posted badges */}
      {isJustPosted ? (
        <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
          Just posted!
        </span>
      ) : isNew ? (
        <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
          New
        </span>
      ) : null}
    </div>
  );
}
