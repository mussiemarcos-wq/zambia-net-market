import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, unauthorized } from "@/lib/api";
import { Prisma } from "@prisma/client";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const listings = await prisma.listing.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    select: {
      id: true,
      title: true,
      categoryId: true,
    },
  });

  if (listings.length === 0) return success([]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const results = await Promise.all(
    listings.map(async (listing) => {
      // Extract meaningful words from listing title (3+ chars, lowercased)
      const words = listing.title
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length >= 3)
        .map((w) => w.replace(/[^a-z0-9]/g, ""))
        .filter(Boolean);

      // 1. Distinct users who searched for terms matching listing title
      let searchUserIds: string[] = [];
      if (words.length > 0) {
        const orConditions = words.map((word) =>
          Prisma.sql`LOWER(query) LIKE ${`%${word}%`}`
        );
        const whereClause = Prisma.join(orConditions, " OR ");

        const searchUsers = await prisma.$queryRaw<{ user_id: string }[]>`
          SELECT DISTINCT user_id
          FROM search_logs
          WHERE (${whereClause})
            AND user_id IS NOT NULL
            AND user_id != ${user.id}
            AND created_at >= ${thirtyDaysAgo}
        `;
        searchUserIds = searchUsers.map((r) => r.user_id);
      }

      // 2. Distinct users who favourited listings in same category (last 30 days)
      const favouriteUsers = await prisma.favourite.findMany({
        where: {
          listing: { categoryId: listing.categoryId },
          createdAt: { gte: thirtyDaysAgo },
          userId: { not: user.id },
        },
        select: { userId: true },
        distinct: ["userId"],
      });
      const favouriteUserIds = favouriteUsers.map((f) => f.userId);

      // 3. Distinct users who viewed listings in same category (last 30 days)
      const viewUsers = await prisma.$queryRaw<{ user_id: string }[]>`
        SELECT DISTINCT vh.user_id
        FROM view_history vh
        JOIN listings l ON vh.listing_id = l.id
        WHERE l.category_id = ${listing.categoryId}
          AND vh.user_id != ${user.id}
          AND vh.viewed_at >= ${thirtyDaysAgo}
      `;
      const viewUserIds = viewUsers.map((r) => r.user_id);

      // Combine unique users across all three sources
      const allUserIds = new Set([
        ...searchUserIds,
        ...favouriteUserIds,
        ...viewUserIds,
      ]);

      return {
        listingId: listing.id,
        title: listing.title,
        interestedBuyers: allUserIds.size,
        searchCount: searchUserIds.length,
        favouriteCount: favouriteUserIds.length,
        viewCount: viewUserIds.length,
      };
    })
  );

  results.sort((a, b) => b.interestedBuyers - a.interestedBuyers);

  return success(results);
}
