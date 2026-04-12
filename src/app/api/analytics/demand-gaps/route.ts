import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Allow admins and sellers (any authenticated user with listings potential)
    if (!["ADMIN", "SELLER", "MEMBER"].includes(user.role)) {
      return unauthorized("Access denied");
    }

    // Demand gaps: searches with zero results, grouped by query (case-insensitive)
    const demandGapsRaw = await prisma.$queryRaw<
      { query: string; searchCount: bigint; lastSearched: Date }[]
    >`
      SELECT
        LOWER(query) as query,
        COUNT(*)::int as "searchCount",
        MAX(created_at) as "lastSearched"
      FROM search_logs
      WHERE result_count = 0
      GROUP BY LOWER(query)
      ORDER BY COUNT(*) DESC
      LIMIT 20
    `;

    const demandGaps = demandGapsRaw.map((row) => ({
      query: row.query,
      searchCount: Number(row.searchCount),
      lastSearched: row.lastSearched,
    }));

    // Hot searches: popular queries that did return results
    const hotSearchesRaw = await prisma.$queryRaw<
      { query: string; searchCount: bigint; avgResults: number }[]
    >`
      SELECT
        LOWER(query) as query,
        COUNT(*)::int as "searchCount",
        AVG(result_count)::float as "avgResults"
      FROM search_logs
      WHERE result_count > 0
      GROUP BY LOWER(query)
      ORDER BY COUNT(*) DESC
      LIMIT 20
    `;

    const hotSearches = hotSearchesRaw.map((row) => ({
      query: row.query,
      searchCount: Number(row.searchCount),
      avgResults: Math.round(Number(row.avgResults)),
    }));

    return success({ demandGaps, hotSearches });
  } catch (err) {
    console.error("GET /api/analytics/demand-gaps error:", err);
    return error("Failed to fetch demand gaps", 500);
  }
}
