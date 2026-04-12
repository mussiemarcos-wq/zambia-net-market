import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ListingStatus } from "@prisma/client";

export async function GET() {
  try {
    const user = await getCurrentUser().catch(() => null);

    let listings;

    if (user) {
      // Get last 20 viewed listings to determine preferred categories
      const viewHistory = await prisma.viewHistory.findMany({
        where: { userId: user.id },
        orderBy: { viewedAt: "desc" },
        take: 20,
        select: { listingId: true },
      });

      if (viewHistory.length === 0) {
        // No view history, fall back to trending
        listings = await getTrendingListings();
      } else {
        const viewedListingIds = viewHistory.map((v) => v.listingId);

        // Find categories of viewed listings
        const viewedListings = await prisma.listing.findMany({
          where: { id: { in: viewedListingIds } },
          select: { categoryId: true },
        });

        const categoryIds = [
          ...new Set(viewedListings.map((l) => l.categoryId)),
        ];

        listings = await prisma.listing.findMany({
          where: {
            status: ListingStatus.ACTIVE,
            categoryId: { in: categoryIds },
            id: { notIn: viewedListingIds },
          },
          orderBy: [
            { isBoosted: "desc" },
            { isFeatured: "desc" },
            { createdAt: "desc" },
          ],
          take: 12,
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            user: {
              select: { id: true, name: true, isVerified: true },
            },
            category: { select: { name: true } },
          },
        });

        // If not enough personalized results, fall back to trending
        if (listings.length === 0) {
          listings = await getTrendingListings();
        }
      }
    } else {
      listings = await getTrendingListings();
    }

    const serialized = listings.map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price ? Number(l.price) : null,
      priceType: l.priceType,
      location: l.location,
      condition: l.condition,
      isFeatured: l.isFeatured,
      isBoosted: l.isBoosted,
      viewsCount: l.viewsCount,
      createdAt: l.createdAt.toISOString(),
      images: l.images.map((img) => ({
        url: img.url,
        thumbnailUrl: img.thumbnailUrl,
      })),
      user: { ...l.user, avatarUrl: null },
      category: l.category,
    }));

    return NextResponse.json({
      listings: serialized,
      type: user ? "personalized" : "trending",
    });
  } catch (err) {
    console.error("GET /api/recommendations error:", err);
    return NextResponse.json({ listings: [], type: "trending" });
  }
}

async function getTrendingListings() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      createdAt: { gte: thirtyDaysAgo },
    },
    orderBy: { viewsCount: "desc" },
    take: 12,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      user: {
        select: { id: true, name: true, isVerified: true },
      },
      category: { select: { name: true } },
    },
  });
}
