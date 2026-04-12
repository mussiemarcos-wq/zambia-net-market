import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error, unauthorized } from "@/lib/api";
import { deleteImage, extractPublicId } from "@/lib/cloudinary";

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

    // Delete from Cloudinary if it's a Cloudinary URL
    if (image.url.includes("cloudinary.com")) {
      const publicId = extractPublicId(image.url);
      if (publicId) {
        try {
          await deleteImage(publicId);
        } catch (err) {
          console.error("Cloudinary delete error:", err);
          // Continue with database deletion even if Cloudinary fails
        }
      }
    }

    // Delete from database
    await prisma.listingImage.delete({ where: { id } });

    return success({ deleted: true });
  } catch (err) {
    console.error("Image delete error:", err);
    return error("Delete failed", 500);
  }
}
