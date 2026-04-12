import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the property category
    const propertyCategory = await prisma.category.findFirst({
      where: { slug: "property" },
    });

    if (!propertyCategory) {
      return error("Property category not found", 404);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        isVerified: true,
        location: true,
        phone: true,
        createdAt: true,
        businessProfile: {
          select: {
            businessName: true,
            description: true,
            website: true,
            operatingHours: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!user) {
      return error("Agent not found", 404);
    }

    // Fetch property listings for this agent
    const listings = await prisma.listing.findMany({
      where: {
        userId: id,
        categoryId: propertyCategory.id,
        status: "ACTIVE",
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          select: { url: true, thumbnailUrl: true },
        },
        subcategory: { select: { name: true } },
      },
      orderBy: [
        { isFeatured: "desc" },
        { isBoosted: "desc" },
        { createdAt: "desc" },
      ],
    });

    // Get stats
    const [totalListings, reviewAgg] = await Promise.all([
      prisma.listing.count({
        where: {
          userId: id,
          categoryId: propertyCategory.id,
        },
      }),
      prisma.review.aggregate({
        where: { sellerId: id },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    const totalViews = listings.reduce((sum, l) => sum + l.viewsCount, 0);
    const totalEnquiries = listings.reduce((sum, l) => sum + l.whatsappClicks, 0);

    const serializedListings = listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      price: listing.price ? Number(listing.price) : null,
      priceType: listing.priceType,
      location: listing.location,
      condition: listing.condition,
      isFeatured: listing.isFeatured,
      isBoosted: listing.isBoosted,
      viewsCount: listing.viewsCount,
      createdAt: listing.createdAt.toISOString(),
      images: listing.images,
      subcategory: listing.subcategory,
      description: listing.description,
    }));

    return success({
      agent: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        location: user.location,
        phone: user.phone,
        memberSince: user.createdAt.toISOString(),
        businessProfile: user.businessProfile,
      },
      listings: serializedListings,
      stats: {
        totalListings,
        activeListings: listings.length,
        totalViews,
        totalEnquiries,
        avgRating: reviewAgg._avg.rating
          ? Math.round(reviewAgg._avg.rating * 10) / 10
          : 0,
        reviewCount: reviewAgg._count.rating,
      },
    });
  } catch (err) {
    console.error("Error fetching agent:", err);
    return error("Failed to fetch agent", 500);
  }
}
