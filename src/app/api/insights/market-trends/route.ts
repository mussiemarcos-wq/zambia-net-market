import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  // Top 10 most searched terms this week
  const trendingSearches = await prisma.searchLog.groupBy({
    by: ["query"],
    where: {
      createdAt: { gte: oneWeekAgo },
      query: { not: "" },
    },
    _count: { query: true },
    orderBy: { _count: { query: "desc" } },
    take: 10,
  });

  // Category breakdown
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  const categoryBreakdown = await Promise.all(
    categories.map(async (cat) => {
      const activeListings = await prisma.listing.count({
        where: { categoryId: cat.id, status: "ACTIVE" },
      });

      const avgPriceResult = await prisma.listing.aggregate({
        where: { categoryId: cat.id, status: "ACTIVE", price: { not: null } },
        _avg: { price: true },
      });

      const newThisWeek = await prisma.listing.count({
        where: {
          categoryId: cat.id,
          createdAt: { gte: oneWeekAgo },
        },
      });

      return {
        name: cat.name,
        slug: cat.slug,
        activeListings,
        avgPrice: avgPriceResult._avg.price
          ? Number(avgPriceResult._avg.price)
          : 0,
        newThisWeek,
      };
    })
  );

  // Price trends: average listing price across all categories for last 4 weeks
  const priceTrends = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

    const weekNumber = getISOWeek(weekStart);
    const year = weekStart.getFullYear();

    const result = await prisma.listing.aggregate({
      where: {
        createdAt: { gte: weekStart, lt: weekEnd },
        price: { not: null },
      },
      _avg: { price: true },
      _count: { id: true },
    });

    priceTrends.push({
      week: `${year}-W${String(weekNumber).padStart(2, "0")}`,
      avgPrice: result._avg.price ? Number(result._avg.price) : 0,
      listingCount: result._count.id,
    });
  }

  // Demand hotspots: locations with most searches grouped by categorySlug
  const demandHotspots = await prisma.searchLog.groupBy({
    by: ["categorySlug"],
    where: {
      createdAt: { gte: fourWeeksAgo },
      categorySlug: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  // Supply gaps: categories where search volume >> listing count
  const searchVolume = await prisma.searchLog.groupBy({
    by: ["categorySlug"],
    where: {
      createdAt: { gte: fourWeeksAgo },
      categorySlug: { not: null },
    },
    _count: { id: true },
  });

  const supplyGaps = await Promise.all(
    searchVolume.map(async (sv) => {
      const category = categories.find((c) => c.slug === sv.categorySlug);
      if (!category) return null;

      const listingCount = await prisma.listing.count({
        where: { categoryId: category.id, status: "ACTIVE" },
      });

      const searchCount = sv._count.id;
      const gap = searchCount - listingCount;

      return {
        category: category.name,
        categorySlug: sv.categorySlug,
        searchCount,
        listingCount,
        gap,
        ratio: listingCount > 0 ? (searchCount / listingCount).toFixed(1) : "N/A",
      };
    })
  );

  const filteredSupplyGaps = supplyGaps
    .filter((g): g is NonNullable<typeof g> => g !== null && g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 10);

  return NextResponse.json({
    trendingSearches: trendingSearches.map((s) => ({
      query: s.query,
      count: s._count.query,
    })),
    categoryBreakdown: categoryBreakdown.sort(
      (a, b) => b.activeListings - a.activeListings
    ),
    priceTrends,
    demandHotspots: demandHotspots.map((d) => ({
      categorySlug: d.categorySlug,
      searchCount: d._count.id,
    })),
    supplyGaps: filteredSupplyGaps,
  });
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
