import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, notFound, error } from "@/lib/api";
import { formatListingForWhatsApp } from "@/lib/whatsapp";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:7333";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        price: true,
        location: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });

    if (!listing) return notFound("Listing not found");

    const price = listing.price ? Number(listing.price) : null;
    const text = formatListingForWhatsApp({
      id: listing.id,
      title: listing.title,
      price,
      location: listing.location,
    });

    return success({
      text,
      title: listing.title,
      price: price != null ? `K${price.toLocaleString()}` : "Contact for price",
      imageUrl: listing.images[0]?.url || null,
      url: `${APP_URL}/listings/${listing.id}`,
    });
  } catch (err) {
    console.error("WhatsApp share error:", err);
    return error("Failed to fetch listing", 500);
  }
}
