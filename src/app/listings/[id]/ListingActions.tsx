"use client";

import { useState } from "react";
import {
  Heart,
  Share2,
  Flag,
  MessageCircle,
  Check,
  X,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { generateWhatsAppLink, generateTelegramLink, formatPrice } from "@/lib/utils";
import { Send } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";

interface ListingActionsProps {
  listingId: string;
  sellerPhone: string;
  listingTitle: string;
  listingPrice: string | number | null;
  isFavourited?: boolean;
  categorySlug?: string;
}

const REPORT_REASONS = [
  { value: "SPAM", label: "Spam" },
  { value: "PROHIBITED", label: "Prohibited item" },
  { value: "FAKE", label: "Fake or misleading" },
  { value: "OFFENSIVE", label: "Offensive content" },
  { value: "SCAM", label: "Scam" },
  { value: "OTHER", label: "Other" },
];

export default function ListingActions({
  listingId,
  sellerPhone,
  listingTitle,
  listingPrice,
  isFavourited: initialFav = false,
  categorySlug,
}: ListingActionsProps) {
  const { user, openAuthModal } = useAppStore();
  const [isFav, setIsFav] = useState(initialFav);
  const [favLoading, setFavLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  async function handleWhatsAppClick() {
    try {
      await fetch(`/api/listings/${listingId}/whatsapp-click`, {
        method: "POST",
      });
    } catch {
      // silently fail tracking
    }
    // Record lead for services category
    if (categorySlug === "services") {
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId,
            buyerName: user?.name || undefined,
            contactMethod: "whatsapp",
          }),
        });
      } catch {
        // silently fail lead tracking
      }
    }
    const priceStr = listingPrice ? formatPrice(listingPrice) : undefined;
    const link = generateWhatsAppLink(sellerPhone, listingTitle, priceStr);
    window.open(link, "_blank", "noopener,noreferrer");
  }

  async function handleTelegramClick() {
    // Record lead for services category
    if (categorySlug === "services") {
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId,
            buyerName: user?.name || undefined,
            contactMethod: "telegram",
          }),
        });
      } catch {
        // silently fail lead tracking
      }
    }
    const priceStr = listingPrice ? formatPrice(listingPrice) : undefined;
    const link = generateTelegramLink(sellerPhone, listingTitle, priceStr);
    window.open(link, "_blank", "noopener,noreferrer");
  }

  async function toggleFavourite() {
    if (!user) {
      openAuthModal("login");
      return;
    }
    setFavLoading(true);
    try {
      const method = isFav ? "DELETE" : "POST";
      const res = await fetch(`/api/favourites/${listingId}`, { method });
      if (res.ok) setIsFav(!isFav);
    } catch {
      // ignore
    } finally {
      setFavLoading(false);
    }
  }

  const listingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/listings/${listingId}`
    : `/listings/${listingId}`;

  async function handleReport() {
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (!reportReason) return;
    setReportSubmitting(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reportReason,
          description: reportDescription || undefined,
        }),
      });
      if (res.ok) {
        setReportSubmitted(true);
      }
    } catch {
      // ignore
    } finally {
      setReportSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Contact buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleWhatsAppClick}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp
        </button>
        <button
          onClick={handleTelegramClick}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors"
        >
          <Send className="w-5 h-5" />
          Telegram
        </button>
      </div>

      {/* Favourite and Share row */}
      <div className="flex gap-2">
        <button
          onClick={toggleFavourite}
          disabled={favLoading}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 px-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Heart
            className={`w-5 h-5 ${
              isFav ? "fill-red-500 text-red-500" : "text-gray-500"
            }`}
          />
          <span className="text-sm font-medium text-gray-700">
            {isFav ? "Saved" : "Save"}
          </span>
        </button>

        <div className="relative flex-1">
          <button
            onClick={() => setShowShare(!showShare)}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 px-4 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Share</span>
          </button>

          {showShare && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-3">
              <ShareButtons
                url={listingUrl}
                title={`${listingTitle} - Zambia.net Marketplace`}
                listingId={listingId}
              />
            </div>
          )}
        </div>
      </div>

      {/* Report button */}
      <button
        onClick={() => {
          if (!user) {
            openAuthModal("login");
            return;
          }
          setShowReport(true);
        }}
        className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-red-500 py-2 transition-colors"
      >
        <Flag className="w-4 h-4" />
        Report this listing
      </button>

      {/* Report modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Report Listing
              </h3>
              <button
                onClick={() => {
                  setShowReport(false);
                  setReportSubmitted(false);
                  setReportReason("");
                  setReportDescription("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-900 font-medium">Report submitted</p>
                <p className="text-gray-500 text-sm mt-1">
                  Thank you for helping keep Zambia.net Marketplace safe.
                </p>
                <button
                  onClick={() => {
                    setShowReport(false);
                    setReportSubmitted(false);
                    setReportReason("");
                    setReportDescription("");
                  }}
                  className="mt-4 px-6 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Reason
                  </label>
                  <div className="space-y-1.5">
                    {REPORT_REASONS.map((r) => (
                      <label
                        key={r.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.value}
                          checked={reportReason === r.value}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Provide more context..."
                  />
                </div>

                <div className="flex gap-2 mt-5">
                  <button
                    onClick={() => {
                      setShowReport(false);
                      setReportReason("");
                      setReportDescription("");
                    }}
                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={!reportReason || reportSubmitting}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reportSubmitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
