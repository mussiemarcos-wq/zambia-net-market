import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error, unauthorized } from "@/lib/api";
import { uploadImage } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const listingId = formData.get("listingId") as string | null;

    if (!file) return error("No file provided");
    if (!listingId) return error("listingId is required");

    if (!ALLOWED_TYPES.includes(file.type)) {
      return error("Invalid file type. Allowed: JPEG, PNG, WebP, GIF");
    }

    if (file.size > MAX_SIZE) {
      return error("File too large. Maximum 5MB");
    }

    // Verify listing belongs to user
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { userId: true, _count: { select: { images: true } } },
    });

    if (!listing) return error("Listing not found", 404);
    if (listing.userId !== user.id) return error("Not your listing", 403);

    // Check image limit (4 photos max for all users)
    const maxImages = 4;
    if (listing._count.images >= maxImages) {
      return error(`Maximum ${maxImages} images allowed`);
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, publicId, thumbnailUrl } = await uploadImage(buffer);

    // Save to database (store publicId in url field for later retrieval)
    const image = await prisma.listingImage.create({
      data: {
        listingId,
        url,
        thumbnailUrl,
        sortOrder: listing._count.images,
      },
    });

    return success({ ...image, publicId }, 201);
  } catch (err) {
    console.error("Image upload error:", err);
    return error("Upload failed", 500);
  }
}
