import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api";
import { cacheGet, cacheSet } from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/cache-keys";

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cached = await cacheGet<unknown[]>(CACHE_KEYS.CATEGORIES);
    if (cached) {
      return success(cached);
    }

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            sortOrder: true,
          },
        },
        _count: {
          select: {
            listings: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    });

    const result = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      sortOrder: cat.sortOrder,
      subcategories: cat.subcategories,
      listingCount: cat._count.listings,
    }));

    // Cache for 5 minutes
    await cacheSet(CACHE_KEYS.CATEGORIES, result, 300);

    return success(result);
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return error("Failed to fetch categories", 500);
  }
}
