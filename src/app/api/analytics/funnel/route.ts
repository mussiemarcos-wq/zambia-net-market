import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const listings = await prisma.listing.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      select: {
        id: true,
        title: true,
        viewsCount: true,
        whatsappClicks: true,
        _count: {
          select: { favourites: true },
        },
      },
    });

    const totalViews = listings.reduce((sum, l) => sum + l.viewsCount, 0);
    const totalClicks = listings.reduce((sum, l) => sum + l.whatsappClicks, 0);
    const totalFavourites = listings.reduce(
      (sum, l) => sum + l._count.favourites,
      0
    );

    const conversionRate =
      totalViews > 0 ? Math.round((totalClicks / totalViews) * 1000) / 10 : 0;
    const favouriteRate =
      totalViews > 0
        ? Math.round((totalFavourites / totalViews) * 1000) / 10
        : 0;

    // Per-listing breakdown sorted by conversion rate
    const listingBreakdown = listings
      .map((l) => ({
        id: l.id,
        title: l.title,
        views: l.viewsCount,
        clicks: l.whatsappClicks,
        favourites: l._count.favourites,
        conversionRate:
          l.viewsCount > 0
            ? Math.round((l.whatsappClicks / l.viewsCount) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate);

    return success({
      summary: {
        views: totalViews,
        clicks: totalClicks,
        favourites: totalFavourites,
        conversionRate,
        favouriteRate,
      },
      listings: listingBreakdown,
    });
  } catch (e) {
    return error("Failed to fetch funnel data");
  }
}
