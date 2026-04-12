import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error, unauthorized } from "@/lib/api";

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

    // Save file
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${uuidv4()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const bytes = new Uint8Array(await file.arrayBuffer());
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, bytes);

    const url = `/uploads/${filename}`;

    // Save to database
    const image = await prisma.listingImage.create({
      data: {
        listingId,
        url,
        thumbnailUrl: url,
        sortOrder: listing._count.images,
      },
    });

    return success(image, 201);
  } catch (err) {
    console.error("Image upload error:", err);
    return error("Upload failed", 500);
  }
}
