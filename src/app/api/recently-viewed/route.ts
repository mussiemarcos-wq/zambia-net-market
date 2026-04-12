import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Get recent view history
    const viewHistory = await prisma.viewHistory.findMany({
      where: { userId: user.id },
      orderBy: { viewedAt: "desc" },
      take: 12,
    });

    if (viewHistory.length === 0) {
      return success([]);
    }

    const listingIds = viewHistory.map((vh) => vh.listingId);

    // Fetch the listings
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        status: "ACTIVE",
      },
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        category: { select: { name: true } },
        user: {
          select: {
            id: true,
            name: true,
            isVerified: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Order by view history order and serialize
    const listingMap = new Map(listings.map((l) => [l.id, l]));
    const serialized = viewHistory
      .map((vh) => {
        const l = listingMap.get(vh.listingId);
        if (!l) return null;
        return {
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
          images: l.images.map((img: { url: string; thumbnailUrl: string | null }) => ({
            url: img.url,
            thumbnailUrl: img.thumbnailUrl,
          })),
          category: { name: l.category.name },
          user: l.user,
        };
      })
      .filter(Boolean);

    return success(serialized);
  } catch (err) {
    console.error("GET /api/recently-viewed error:", err);
    return error("Failed to fetch recently viewed", 500);
  }
}
