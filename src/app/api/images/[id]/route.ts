import { NextRequest } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error, unauthorized } from "@/lib/api";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await params;

    const image = await prisma.listingImage.findUnique({
      where: { id },
      include: { listing: { select: { userId: true } } },
    });

    if (!image) return error("Image not found", 404);
    if (image.listing.userId !== user.id) return error("Not your image", 403);

    // Delete file from disk
    try {
      const filepath = path.join(process.cwd(), "public", image.url);
      await unlink(filepath);
    } catch {
      // File may already be deleted
    }

    // Delete from database
    await prisma.listingImage.delete({ where: { id } });

    return success({ deleted: true });
  } catch (err) {
    console.error("Image delete error:", err);
    return error("Delete failed", 500);
  }
}
