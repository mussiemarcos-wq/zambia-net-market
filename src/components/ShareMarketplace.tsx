"use client";

import ShareButtons from "@/components/ShareButtons";

export default function ShareMarketplace() {
  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://marketplace-navy-omega.vercel.app";

  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Spread the word!
        </p>
        <p className="text-xs text-gray-500">
          Share Zambia.net Marketplace with your network
        </p>
      </div>
      <ShareButtons
        url={appUrl}
        title="Check out Zambia.net Marketplace — buy, sell, and connect locally!"
      />
    </div>
  );
}
