"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";
import ShareButtons from "./ShareButtons";
import { useAppStore } from "@/lib/store";

interface AutoSharePromptProps {
  listingId: string;
  listingTitle: string;
  listingUrl: string;
  createdAt: string;
  sellerId: string;
}

export default function AutoSharePrompt({
  listingId,
  listingTitle,
  listingUrl,
  createdAt,
  sellerId,
}: AutoSharePromptProps) {
  const { user } = useAppStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if the listing was created less than 5 minutes ago
    const createdTime = new Date(createdAt).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now - createdTime > fiveMinutes) return;

    // Only show if current user is the seller
    if (!user || user.id !== sellerId) return;

    // Check if dismissed in localStorage
    const dismissKey = `share-dismissed-${listingId}`;
    if (localStorage.getItem(dismissKey)) return;

    setVisible(true);
  }, [listingId, createdAt, sellerId, user]);

  function dismiss() {
    const dismissKey = `share-dismissed-${listingId}`;
    localStorage.setItem(dismissKey, "1");
    setVisible(false);
  }

  function shareToWhatsApp() {
    const text = encodeURIComponent(
      `Check out my listing: "${listingTitle}" on Zambia.net Marketplace\n${listingUrl}`
    );
    window.open(
      `https://wa.me/?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (!visible) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6 relative">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>

      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Your listing is live!
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Share it to get more buyers:
      </p>

      <div className="space-y-3">
        <ShareButtons
          url={listingUrl}
          title={listingTitle}
          listingId={listingId}
        />

        <button
          onClick={shareToWhatsApp}
          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Share to WhatsApp Group
        </button>
      </div>
    </div>
  );
}
