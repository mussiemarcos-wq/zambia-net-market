import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error, unauthorized } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const listingId = request.nextUrl.searchParams.get("listingId");
  if (!listingId) return error("listingId is required");

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        images: { select: { id: true } },
      },
    });

    if (!listing) return error("Listing not found", 404);
    if (listing.userId !== user.id) return unauthorized("Not your listing");

    // Find competitors in the same category (and subcategory if available)
    const where: Record<string, unknown> = {
      status: "ACTIVE" as const,
      categoryId: listing.categoryId,
      userId: { not: user.id },
    };
    if (listing.subcategoryId) {
      where.subcategoryId = listing.subcategoryId;
    }

    const competitors = await prisma.listing.findMany({
      where,
      select: {
        price: true,
        viewsCount: true,
        images: { select: { id: true } },
      },
    });

    if (competitors.length === 0) {
      return success({
        competitorCount: 0,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        yourPrice: listing.price ? Number(listing.price) : 0,
        pricePosition: "average" as const,
        percentile: 50,
        avgViews: 0,
        yourViews: listing.viewsCount,
        avgPhotos: 0,
        yourPhotos: listing.images.length,
        tips: ["You're the only listing in this category. Great opportunity!"],
      });
    }

    const prices = competitors
      .map((c) => (c.price ? Number(c.price) : null))
      .filter((p): p is number => p !== null);

    const yourPrice = listing.price ? Number(listing.price) : 0;
    const avgPrice = prices.length > 0
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Calculate price position
    let pricePosition: "cheapest" | "below_avg" | "average" | "above_avg" | "most_expensive";
    let percentile = 50;

    if (prices.length > 0 && yourPrice > 0) {
      const belowCount = prices.filter((p) => p < yourPrice).length;
      percentile = Math.round((belowCount / prices.length) * 100);

      if (yourPrice <= minPrice) pricePosition = "cheapest";
      else if (yourPrice >= maxPrice) pricePosition = "most_expensive";
      else if (yourPrice < avgPrice * 0.9) pricePosition = "below_avg";
      else if (yourPrice > avgPrice * 1.1) pricePosition = "above_avg";
      else pricePosition = "average";
    } else {
      pricePosition = "average";
    }

    const avgViews = Math.round(
      competitors.reduce((sum, c) => sum + c.viewsCount, 0) / competitors.length
    );
    const avgPhotos = Math.round(
      competitors.reduce((sum, c) => sum + c.images.length, 0) / competitors.length
    );
    const yourPhotos = listing.images.length;

    // Generate tips
    const tips: string[] = [];

    if (prices.length > 0 && yourPrice > avgPrice * 1.1) {
      const abovePercent = Math.round(((yourPrice - avgPrice) / avgPrice) * 100);
      tips.push(
        `Your price is ${abovePercent}% above average. Consider lowering to ${formatPrice(avgPrice)} for faster sale`
      );
    }

    if (avgPhotos > 0 && yourPhotos < avgPhotos) {
      tips.push(
        `Competitors average ${avgPhotos} photos. Add more photos to stand out`
      );
    }

    if (listing.viewsCount < avgViews) {
      tips.push(
        "Your listing has fewer views than average. Try boosting for more visibility"
      );
    }

    if (prices.length > 0 && yourPrice > 0 && yourPrice < avgPrice * 0.9) {
      tips.push(
        "Your price is below average - great for quick sales, but make sure you're not undervaluing"
      );
    }

    if (tips.length === 0) {
      tips.push("Your listing is well-positioned against competitors. Keep it up!");
    }

    return success({
      competitorCount: competitors.length,
      avgPrice,
      minPrice,
      maxPrice,
      yourPrice,
      pricePosition,
      percentile,
      avgViews,
      yourViews: listing.viewsCount,
      avgPhotos,
      yourPhotos,
      tips,
    });
  } catch (e) {
    return error("Failed to fetch competitor data");
  }
}
