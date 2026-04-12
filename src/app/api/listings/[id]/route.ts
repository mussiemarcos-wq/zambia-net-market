import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden, notFound } from "@/lib/api";
import { ListingStatus, Prisma } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            isVerified: true,
            avatarUrl: true,
            location: true,
            createdAt: true,
          },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        subcategory: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!listing) return notFound("Listing not found");

    // Increment view count in the background
    await prisma.listing.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    // Track view history for authenticated users (fire-and-forget)
    const user = await getCurrentUser().catch(() => null);
    if (user) {
      prisma.viewHistory
        .upsert({
          where: {
            userId_listingId: { userId: user.id, listingId: id },
          },
          update: { viewedAt: new Date() },
          create: { userId: user.id, listingId: id },
        })
        .catch(() => {});
    }

    return success({ ...listing, viewsCount: listing.viewsCount + 1 });
  } catch (err) {
    console.error("GET /api/listings/[id] error:", err);
    return error("Failed to fetch listing", 500);
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await context.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!listing) return notFound("Listing not found");
    if (listing.userId !== user.id) return forbidden("You can only edit your own listings");

    const body = await request.json();
    const allowedFields = [
      "title",
      "description",
      "price",
      "priceType",
      "categoryId",
      "subcategoryId",
      "condition",
      "location",
      "status",
      "latitude",
      "longitude",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "price") {
          data[field] = body[field] != null ? new Prisma.Decimal(body[field]) : null;
        } else if (field === "latitude" || field === "longitude") {
          data[field] = body[field] != null ? new Prisma.Decimal(parseFloat(body[field])) : null;
        } else {
          data[field] = body[field];
        }
      }
    }

    const updated = await prisma.listing.update({
      where: { id },
      data,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
      },
    });

    return success(updated);
  } catch (err) {
    console.error("PUT /api/listings/[id] error:", err);
    return error("Failed to update listing", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await context.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!listing) return notFound("Listing not found");

    const isOwner = listing.userId === user.id;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!isOwner && !isAdmin) {
      return forbidden("You can only delete your own listings");
    }

    await prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.REMOVED },
    });

    return success({ message: "Listing removed" });
  } catch (err) {
    console.error("DELETE /api/listings/[id] error:", err);
    return error("Failed to delete listing", 500);
  }
}
