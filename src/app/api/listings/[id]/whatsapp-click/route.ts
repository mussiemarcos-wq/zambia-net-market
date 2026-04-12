import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error, notFound } from "@/lib/api";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!listing) return notFound("Listing not found");

    await prisma.listing.update({
      where: { id },
      data: { whatsappClicks: { increment: 1 } },
    });

    return success({ message: "WhatsApp click recorded" });
  } catch (err) {
    console.error("POST /api/listings/[id]/whatsapp-click error:", err);
    return error("Failed to record click", 500);
  }
}
