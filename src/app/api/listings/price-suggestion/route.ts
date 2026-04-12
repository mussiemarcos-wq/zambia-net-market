import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api";
import { ListingStatus, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const categoryId = searchParams.get("categoryId");
    const condition = searchParams.get("condition");

    if (!categoryId) {
      return error("categoryId is required");
    }

    const where: Prisma.ListingWhereInput = {
      categoryId,
      status: ListingStatus.ACTIVE,
      price: { not: null },
    };

    if (condition) {
      where.condition = condition as Prisma.EnumItemConditionFilter;
    }

    const listings = await prisma.listing.findMany({
      where,
      select: { price: true },
      orderBy: { price: "asc" },
    });

    if (listings.length === 0) {
      return success({ min: 0, max: 0, average: 0, median: 0, count: 0, currency: "ZMW" });
    }

    const prices = listings
      .map((l) => parseFloat(l.price!.toString()))
      .filter((p) => p > 0)
      .sort((a, b) => a - b);

    if (prices.length === 0) {
      return success({ min: 0, max: 0, average: 0, median: 0, count: 0, currency: "ZMW" });
    }

    const min = prices[0];
    const max = prices[prices.length - 1];
    const average = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);

    let median: number;
    const mid = Math.floor(prices.length / 2);
    if (prices.length % 2 === 0) {
      median = Math.round((prices[mid - 1] + prices[mid]) / 2);
    } else {
      median = Math.round(prices[mid]);
    }

    return success({
      min: Math.round(min),
      max: Math.round(max),
      average,
      median,
      count: prices.length,
      currency: "ZMW",
    });
  } catch (err) {
    console.error("GET /api/listings/price-suggestion error:", err);
    return error("Failed to fetch price suggestion", 500);
  }
}
