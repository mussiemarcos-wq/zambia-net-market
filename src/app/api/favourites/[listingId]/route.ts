import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error, unauthorized, notFound } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { listingId } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) return notFound("Listing not found");

    const favourite = await prisma.favourite.upsert({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        listingId,
      },
    });

    return success(favourite, 201);
  } catch (err) {
    console.error("Failed to add favourite:", err);
    return error("Failed to add favourite", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { listingId } = await params;

    await prisma.favourite.deleteMany({
      where: {
        userId: user.id,
        listingId,
      },
    });

    return success({ message: "Removed from favourites" });
  } catch (err) {
    console.error("Failed to remove favourite:", err);
    return error("Failed to remove favourite", 500);
  }
}
