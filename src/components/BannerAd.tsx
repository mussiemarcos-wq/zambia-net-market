"use client";

import { useEffect, useState } from "react";

interface BannerData {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: string;
}

export default function BannerAd({ placement }: { placement: string }) {
  const [banner, setBanner] = useState<BannerData | null>(null);

  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await fetch(`/api/banners?placement=${placement}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.banner) {
          setBanner(data.banner);
        }
      } catch {
        // Silently fail - banner ads are non-critical
      }
    }
    fetchBanner();
  }, [placement]);

  if (!banner) return null;

  const handleClick = () => {
    // Fire click tracking, don't block navigation
    fetch(`/api/banners/${banner.id}/click`, { method: "POST" }).catch(() => {});
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-4">
      <a
        href={banner.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block"
      >
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="w-full rounded-xl object-cover max-h-48"
        />
      </a>
      <span className="absolute top-6 right-6 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
        Ad
      </span>
    </div>
  );
}
