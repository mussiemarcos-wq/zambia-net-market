import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
      },
    });

    const results = await Promise.all(
      categories.map(async (cat) => {
        // Active listings count
        const activeListings = await prisma.listing.count({
          where: { categoryId: cat.id, status: "ACTIVE" },
        });

        // New listings this week
        const newThisWeek = await prisma.listing.count({
          where: {
            categoryId: cat.id,
            createdAt: { gte: oneWeekAgo },
          },
        });

        // New listings last week (for growth rate)
        const newLastWeek = await prisma.listing.count({
          where: {
            categoryId: cat.id,
            createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo },
          },
        });

        // Weekly views (sum viewsCount of listings created in last 7 days)
        const recentListings = await prisma.listing.aggregate({
          where: {
            categoryId: cat.id,
            createdAt: { gte: oneWeekAgo },
          },
          _sum: { viewsCount: true },
        });
        const weeklyViews = recentListings._sum.viewsCount || 0;

        // Growth rate
        const growthRate =
          newLastWeek > 0
            ? Math.round(((newThisWeek - newLastWeek) / newLastWeek) * 100)
            : newThisWeek > 0
              ? 100
              : 0;

        // Demand score from SearchLog
        const searchCount = await prisma.searchLog.count({
          where: { categorySlug: cat.slug },
        });

        const demandScore =
          activeListings > 0
            ? Math.round((searchCount / activeListings) * 10) / 10
            : searchCount > 0
              ? 10
              : 0;

        let opportunity: "high" | "medium" | "low";
        if (demandScore > 2) opportunity = "high";
        else if (demandScore >= 1) opportunity = "medium";
        else opportunity = "low";

        return {
          categoryName: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          activeListings,
          newThisWeek,
          weeklyViews,
          growthRate,
          demandScore,
          opportunity,
        };
      })
    );

    // Sort by demand score DESC
    results.sort((a, b) => b.demandScore - a.demandScore);

    return success(results);
  } catch (e) {
    return error("Failed to fetch category health data");
  }
}
