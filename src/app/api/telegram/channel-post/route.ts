import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unauthorized, error, success } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { escapeMarkdown } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  // Allow admin or cron access
  const cronSecret = req.headers.get("x-cron-secret");
  const isCron = cronSecret === process.env.CRON_SECRET;

  if (!isCron) {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return unauthorized("Admin or cron access required");
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Get top 10 hot listings from the past week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      createdAt: { gte: oneWeekAgo },
    },
    include: {
      category: true,
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      user: { select: { name: true, location: true } },
    },
    orderBy: [
      { isFeatured: "desc" },
      { isBoosted: "desc" },
      { viewsCount: "desc" },
    ],
    take: 10,
  });

  if (listings.length === 0) {
    return success({ post: "No hot listings this week." });
  }

  // Build Telegram-formatted channel post
  const lines: string[] = [
    "🔥 *Hot Listings This Week on Zambia\\.net Marketplace* 🔥",
    "",
  ];

  listings.forEach((listing, i) => {
    const price =
      listing.priceType === "FREE"
        ? "Free"
        : listing.priceType === "CONTACT"
          ? "Contact for price"
          : formatPrice(listing.price as unknown as number);

    const location = listing.location
      ? ` \\| 📍 ${escapeMarkdown(listing.location)}`
      : "";
    const category = `🏷 ${escapeMarkdown(listing.category.name)}`;
    const link = `${appUrl}/listings/${listing.id}`;
    const featured = listing.isFeatured ? " ⭐" : "";

    lines.push(
      `*${i + 1}\\.* [${escapeMarkdown(listing.title)}](${link})${featured}`
    );
    lines.push(`   💰 ${price}${location}`);
    lines.push(`   ${category} \\| 👁 ${listing.viewsCount} views`);
    lines.push("");
  });

  lines.push("—————————————————");
  lines.push(
    `👉 Browse all listings: [Zambia\\.net Marketplace](${appUrl})`
  );
  lines.push("");
  lines.push("_Post new listings for free\\!_ 🚀");

  const post = lines.join("\n");

  return success({ post, listingCount: listings.length });
}
