import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error, notFound } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        isVerified: true,
        location: true,
        createdAt: true,
        role: true,
        _count: {
          select: {
            listings: {
              where: { status: "ACTIVE" },
            },
          },
        },
        businessProfile: {
          select: {
            id: true,
            businessName: true,
            logoUrl: true,
            coverUrl: true,
            description: true,
            operatingHours: true,
            website: true,
            subscriptionTier: true,
          },
        },
      },
    });

    if (!user) return notFound("User not found");

    const ratingAgg = await prisma.review.aggregate({
      where: { sellerId: id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const result = {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      location: user.location,
      createdAt: user.createdAt,
      role: user.role,
      activeListingCount: user._count.listings,
      rating: {
        average: ratingAgg._avg.rating
          ? Math.round(ratingAgg._avg.rating * 10) / 10
          : null,
        count: ratingAgg._count.rating,
      },
      businessProfile: user.businessProfile,
    };

    return success(result);
  } catch (err) {
    console.error("Failed to fetch user profile:", err);
    return error("Failed to fetch user profile", 500);
  }
}
