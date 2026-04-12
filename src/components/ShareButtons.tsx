"use client";

import { useState } from "react";
import { Check, Link as LinkIcon } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  listingId?: string;
}

export default function ShareButtons({
  url,
  title,
  description,
  listingId,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  function trackShare(platform: string) {
    if (!listingId) return;
    fetch(`/api/listings/${listingId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform }),
    }).catch(() => {});
  }

  function shareWhatsApp() {
    trackShare("whatsapp");
    const text = encodeURIComponent(`${title}\n${url}`);
    window.open(
      `https://wa.me/?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareTelegram() {
    trackShare("telegram");
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(title);
    window.open(
      `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareFacebook() {
    trackShare("facebook");
    const encodedUrl = encodeURIComponent(url);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareTwitter() {
    trackShare("twitter");
    const encodedText = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);
    window.open(
      `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function copyLink() {
    trackShare("copy");
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      {/* WhatsApp */}
      <button
        onClick={shareWhatsApp}
        title="Share on WhatsApp"
        className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors text-sm font-bold"
      >
        WA
      </button>

      {/* Telegram */}
      <button
        onClick={shareTelegram}
        title="Share on Telegram"
        className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors text-sm font-bold"
      >
        TG
      </button>

      {/* Facebook */}
      <button
        onClick={shareFacebook}
        title="Share on Facebook"
        className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors text-sm font-bold"
      >
        FB
      </button>

      {/* Twitter/X */}
      <button
        onClick={shareTwitter}
        title="Share on X"
        className="w-10 h-10 rounded-full bg-gray-900 hover:bg-black text-white flex items-center justify-center transition-colors text-sm font-bold"
      >
        X
      </button>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        title={copied ? "Copied!" : "Copy link"}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          copied
            ? "bg-green-100 text-green-600"
            : "bg-gray-200 hover:bg-gray-300 text-gray-600"
        }`}
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <LinkIcon className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
