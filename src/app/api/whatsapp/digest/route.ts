import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { ListingStatus } from "@prisma/client";

const BASE_URL = "https://marketplace-navy-omega.vercel.app";

export async function GET(req: NextRequest) {
  // Auth: admin only OR cron secret header
  const cronSecret = req.headers.get("x-cron-secret");
  const validCronSecret = process.env.CRON_SECRET;

  if (cronSecret && validCronSecret && cronSecret === validCronSecret) {
    // Authenticated via cron secret
  } else {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Admin access required");
  }

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

  // Format as WhatsApp-friendly message
  const categoryEmoji: Record<string, string> = {
    property: "\u{1F3E0}",
    vehicles: "\u{1F697}",
    electronics: "\u{1F4F1}",
    fashion: "\u{1F455}",
    services: "\u{1F6E0}\u{FE0F}",
    jobs: "\u{1F4BC}",
  };

  let message = "\u{1F525} *Hot Listings This Week on Zambia.net Marketplace* \u{1F525}\n\n";

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

  return success({
    message,
    listingCount: listings.length,
    generatedAt: new Date().toISOString(),
  });
}
