import { PrismaClient, Prisma } from "@prisma/client";

interface DealInput {
  price?: number | Prisma.Decimal | null;
  priceType: string;
  categoryId: string;
}

interface DealScoreResult {
  score: "great_deal" | "fair_price" | "above_market" | null;
  percentage: number;
}

export async function calculateDealScore(
  listing: DealInput,
  prisma: PrismaClient
): Promise<DealScoreResult> {
  // If price is CONTACT, FREE, or null, no deal score
  if (
    listing.priceType === "CONTACT" ||
    listing.priceType === "FREE" ||
    !listing.price ||
    Number(listing.price) <= 0
  ) {
    return { score: null, percentage: 0 };
  }

  const categoryAgg = await prisma.listing.aggregate({
    where: {
      categoryId: listing.categoryId,
      status: "ACTIVE",
      price: { not: null, gt: 0 },
    },
    _avg: { price: true },
    _count: { price: true },
  });

  // Need at least 3 listings in category for comparison
  if (!categoryAgg._avg.price || categoryAgg._count.price < 3) {
    return { score: null, percentage: 0 };
  }

  const avgPrice = Number(categoryAgg._avg.price);
  const listingPrice = Number(listing.price);
  const ratio = listingPrice / avgPrice;
  const percentage = Math.round((ratio - 1) * 100);

  if (ratio < 0.7) {
    return { score: "great_deal", percentage };
  }

  if (ratio <= 1.1) {
    return { score: "fair_price", percentage };
  }

  return { score: "above_market", percentage };
}
