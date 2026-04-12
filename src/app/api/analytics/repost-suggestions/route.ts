import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const listings = await prisma.listing.findMany({
    where: {
      userId: user.id,
      status: "ACTIVE",
      OR: [
        // High views, no enquiries
        { viewsCount: { gt: 10 }, whatsappClicks: 0 },
        // Decent views, very low conversion
        { viewsCount: { gt: 20 }, whatsappClicks: { lt: 2 } },
        // Stale listing: older than 14 days with very few views
        { createdAt: { lt: fourteenDaysAgo }, viewsCount: { lt: 5 } },
      ],
    },
    select: {
      id: true,
      title: true,
      price: true,
      viewsCount: true,
      whatsappClicks: true,
      createdAt: true,
    },
    orderBy: { viewsCount: "desc" },
  });

  const suggestions = listings.map((listing) => {
    const isStale =
      listing.createdAt < fourteenDaysAgo && listing.viewsCount < 5;
    const highViewsNoClicks =
      listing.viewsCount > 10 && listing.whatsappClicks === 0;

    let suggestion: string;
    let severity: "warning" | "info";

    if (highViewsNoClicks) {
      suggestion = `Your listing got ${listing.viewsCount} views but no enquiries. Try lowering the price by 10% or updating the title.`;
      severity = "warning";
    } else if (
      listing.viewsCount > 20 &&
      listing.whatsappClicks < 2
    ) {
      suggestion = `Your listing has ${listing.viewsCount} views but only ${listing.whatsappClicks} enquiries. Consider adding better photos or a more detailed description.`;
      severity = "warning";
    } else if (isStale) {
      suggestion =
        "This listing has had very few views in 14 days. Try reposting with a new title or lower price.";
      severity = "info";
    } else {
      suggestion = `Your listing got ${listing.viewsCount} views but no enquiries. Try lowering the price by 10% or updating the title.`;
      severity = "warning";
    }

    return {
      listingId: listing.id,
      title: listing.title,
      price: listing.price ? listing.price.toString() : null,
      viewsCount: listing.viewsCount,
      whatsappClicks: listing.whatsappClicks,
      suggestion,
      severity,
    };
  });

  return success(suggestions);
}
