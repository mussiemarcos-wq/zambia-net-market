import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { error, unauthorized } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("categorySlug");

  if (!categorySlug) {
    return error("categorySlug query parameter is required");
  }

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    return error("Category not found", 404);
  }

  const now = new Date();
  const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

  // Get weekly average prices for the last 12 weeks
  const weeks = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

    const weekNumber = getISOWeek(weekStart);
    const year = weekStart.getFullYear();

    const result = await prisma.listing.aggregate({
      where: {
        categoryId: category.id,
        createdAt: { gte: weekStart, lt: weekEnd },
        price: { not: null },
      },
      _avg: { price: true },
      _count: { id: true },
    });

    weeks.push({
      week: `${year}-W${String(weekNumber).padStart(2, "0")}`,
      avgPrice: result._avg.price ? Number(result._avg.price) : 0,
      listingCount: result._count.id,
    });
  }

  // Overall stats for the period
  const overallStats = await prisma.listing.aggregate({
    where: {
      categoryId: category.id,
      createdAt: { gte: twelveWeeksAgo },
      price: { not: null },
    },
    _avg: { price: true },
    _min: { price: true },
    _max: { price: true },
  });

  // Current average (active listings only)
  const currentAvg = await prisma.listing.aggregate({
    where: {
      categoryId: category.id,
      status: "ACTIVE",
      price: { not: null },
    },
    _avg: { price: true },
  });

  return NextResponse.json({
    category: category.name,
    categorySlug: category.slug,
    weeks,
    stats: {
      min: overallStats._min.price ? Number(overallStats._min.price) : 0,
      max: overallStats._max.price ? Number(overallStats._max.price) : 0,
      average: overallStats._avg.price ? Number(overallStats._avg.price) : 0,
      currentAverage: currentAvg._avg.price ? Number(currentAvg._avg.price) : 0,
    },
  });
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
