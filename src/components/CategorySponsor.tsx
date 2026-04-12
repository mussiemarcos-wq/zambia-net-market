"use client";

import { useEffect, useState } from "react";

interface Sponsor {
  id: string;
  businessName: string;
  logoUrl: string | null;
  advertiserId: string;
}

export default function CategorySponsor({ categorySlug }: { categorySlug: string }) {
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);

  useEffect(() => {
    if (!categorySlug) return;

    async function fetchSponsor() {
      try {
        const res = await fetch(`/api/sponsorships?category=${categorySlug}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.sponsorships && data.sponsorships.length > 0) {
          setSponsor(data.sponsorships[0]);
          // Track impression
          fetch(`/api/sponsorships/impression`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sponsorshipId: data.sponsorships[0].id }),
          }).catch(() => {});
        }
      } catch {
        // Silently fail - sponsor display is non-critical
      }
    }

    fetchSponsor();
  }, [categorySlug]);

  if (!sponsor) return null;

  return (
    <div className="mb-4 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex items-center gap-3">
      {sponsor.logoUrl && (
        <img
          src={sponsor.logoUrl}
          alt={sponsor.businessName}
          className="w-8 h-8 rounded-full object-cover border border-blue-200"
        />
      )}
      <p className="text-sm text-blue-700">
        <span className="text-blue-400 font-normal">Sponsored by</span>{" "}
        <a
          href={`/sellers/${sponsor.advertiserId}`}
          className="font-semibold hover:underline"
        >
          {sponsor.businessName}
        </a>
      </p>
    </div>
  );
}
