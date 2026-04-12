import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, forbidden } from "@/lib/api";
import { ListingStatus, Prisma } from "@prisma/client";

export async function GET() {
  try {
    // Auth check - admin or cron
    const user = await getCurrentUser().catch(() => null);
    if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return forbidden("Admin access required");
    }

    const activeSavedSearches = await prisma.savedSearch.findMany({
      where: { isActive: true },
    });

    let notificationsSent = 0;

    for (const search of activeSavedSearches) {
      const sinceDate = search.lastNotified || search.createdAt;

      // Build listing query matching saved search criteria
      const where: Prisma.ListingWhereInput = {
        status: ListingStatus.ACTIVE,
        createdAt: { gt: sinceDate },
      };

      if (search.query) {
        where.OR = [
          { title: { contains: search.query, mode: "insensitive" } },
          { description: { contains: search.query, mode: "insensitive" } },
        ];
      }

      if (search.categorySlug) {
        where.category = { slug: search.categorySlug };
      }

      if (search.minPrice != null) {
        where.price = {
          ...(where.price as Prisma.DecimalNullableFilter || {}),
          gte: new Prisma.Decimal(Number(search.minPrice)),
        };
      }

      if (search.maxPrice != null) {
        where.price = {
          ...(where.price as Prisma.DecimalNullableFilter || {}),
          lte: new Prisma.Decimal(Number(search.maxPrice)),
        };
      }

      if (search.location) {
        where.location = { contains: search.location, mode: "insensitive" };
      }

      const matchCount = await prisma.listing.count({ where });

      if (matchCount > 0) {
        const searchLabel = search.query
          ? `'${search.query}'`
          : search.categorySlug
            ? `in ${search.categorySlug}`
            : "your saved filters";

        await prisma.notification.create({
          data: {
            userId: search.userId,
            type: "SAVED_SEARCH",
            title: "New matches found!",
            body: `${matchCount} new listing${matchCount !== 1 ? "s" : ""} match your saved search ${searchLabel}`,
            data: {
              savedSearchId: search.id,
              matchCount,
              query: search.query,
              categorySlug: search.categorySlug,
            },
          },
        });

        await prisma.savedSearch.update({
          where: { id: search.id },
          data: { lastNotified: new Date() },
        });

        notificationsSent++;
      }
    }

    return success({
      checked: activeSavedSearches.length,
      notificationsSent,
    });
  } catch (err) {
    console.error("GET /api/saved-searches/check error:", err);
    return error("Failed to check saved searches", 500);
  }
}
