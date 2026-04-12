import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const { sellerId, rating, comment, listingId } = body;

    if (!sellerId) return error("sellerId is required");

    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return error("Rating must be an integer between 1 and 5");
    }

    if (sellerId === user.id) {
      return error("You cannot review yourself");
    }

    // Verify seller exists
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { id: true },
    });

    if (!seller) return error("Seller not found");

    const review = await prisma.review.upsert({
      where: {
        reviewerId_sellerId: {
          reviewerId: user.id,
          sellerId,
        },
      },
      update: {
        rating,
        comment: comment || null,
        listingId: listingId || null,
      },
      create: {
        reviewerId: user.id,
        sellerId,
        rating,
        comment: comment || null,
        listingId: listingId || null,
      },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    return success(review, 201);
  } catch (err) {
    console.error("Review POST error:", err);
    return error("Failed to submit review", 500);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get("sellerId");

  if (!sellerId) return error("sellerId query parameter is required");

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
  const skip = (page - 1) * limit;

  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { sellerId },
        include: {
          reviewer: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { sellerId } }),
    ]);

    return success({
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Review GET error:", err);
    return error("Failed to fetch reviews", 500);
  }
}
