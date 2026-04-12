import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ListingStatus } from "@prisma/client";
import DigestClient from "./DigestClient";

export const dynamic = "force-dynamic";

const BASE_URL = "https://marketplace-navy-omega.vercel.app";

export default async function AdminDigestPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  // Query top 10 listings from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const listings = await prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      createdAt: { gte: sevenDaysAgo },
    },
    orderBy: { viewsCount: "desc" },
    take: 10,
    include: {
      category: { select: { name: true, slug: true } },
    },
  });

  // Format the message server-side
  const categoryEmoji: Record<string, string> = {
    property: "\u{1F3E0}",
    vehicles: "\u{1F697}",
    electronics: "\u{1F4F1}",
    fashion: "\u{1F455}",
    services: "\u{1F6E0}\u{FE0F}",
    jobs: "\u{1F4BC}",
  };

  let message = "\u{1F525} *Hot Listings This Week on Zambia.net Market* \u{1F525}\n\n";

  listings.forEach((listing, index) => {
    const emoji = categoryEmoji[listing.category?.slug ?? ""] ?? "\u{1F4E6}";
    const price =
      listing.priceType === "FREE"
        ? "Free"
        : listing.priceType === "CONTACT"
          ? "Contact for Price"
          : formatPrice(listing.price as unknown as number);

    message += `${index + 1}. ${emoji} *${listing.title}* - ${price}\n`;
    if (listing.location) {
      message += `\u{1F4CD} ${listing.location} | \u{1F441} ${listing.viewsCount} views\n`;
    } else {
      message += `\u{1F441} ${listing.viewsCount} views\n`;
    }
    message += `\u{1F449} ${BASE_URL}/listings/${listing.id}\n\n`;
  });

  message += `\u{1F4F2} Post your ad: ${BASE_URL}/listings/new`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            WhatsApp Hot Listings Digest
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Top {listings.length} listings from the past 7 days by views. Copy and paste into your WhatsApp group.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <DigestClient initialMessage={message} />
        </div>
      </div>
    </div>
  );
}
