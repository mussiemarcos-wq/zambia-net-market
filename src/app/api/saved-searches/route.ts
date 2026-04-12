import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const serialized = savedSearches.map((s) => ({
      id: s.id,
      query: s.query,
      categorySlug: s.categorySlug,
      minPrice: s.minPrice ? s.minPrice.toString() : null,
      maxPrice: s.maxPrice ? s.maxPrice.toString() : null,
      location: s.location,
      isActive: s.isActive,
      lastNotified: s.lastNotified?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
    }));

    return success(serialized);
  } catch (err) {
    console.error("GET /api/saved-searches error:", err);
    return error("Failed to fetch saved searches", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const { query, categorySlug, minPrice, maxPrice, location } = body;

    // At least one filter must be provided
    if (!query && !categorySlug && !minPrice && !maxPrice && !location) {
      return error("At least one search filter must be provided");
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: user.id,
        query: query || null,
        categorySlug: categorySlug || null,
        minPrice: minPrice != null ? parseFloat(minPrice) : null,
        maxPrice: maxPrice != null ? parseFloat(maxPrice) : null,
        location: location || null,
      },
    });

    return success({
      id: savedSearch.id,
      query: savedSearch.query,
      categorySlug: savedSearch.categorySlug,
      minPrice: savedSearch.minPrice ? savedSearch.minPrice.toString() : null,
      maxPrice: savedSearch.maxPrice ? savedSearch.maxPrice.toString() : null,
      location: savedSearch.location,
      isActive: savedSearch.isActive,
      lastNotified: savedSearch.lastNotified?.toISOString() ?? null,
      createdAt: savedSearch.createdAt.toISOString(),
    }, 201);
  } catch (err) {
    console.error("POST /api/saved-searches error:", err);
    return error("Failed to save search", 500);
  }
}
