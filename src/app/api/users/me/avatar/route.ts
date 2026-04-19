import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error, unauthorized } from "@/lib/api";
import { uploadImage, deleteImage, extractPublicId } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return error("No file provided");

    if (!ALLOWED_TYPES.includes(file.type)) {
      return error("Invalid file type. Allowed: JPEG, PNG, WebP, GIF");
    }

    if (file.size > MAX_SIZE) {
      return error("File too large. Maximum 5MB");
    }

    // Get full user to check existing avatar
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true },
    });

    // Upload to Cloudinary
    const bytes = new Uint8Array(await file.arrayBuffer());
    const uploaded = await uploadImage(Buffer.from(bytes), "marketplace/avatars");

    // Delete the old avatar from Cloudinary if it exists
    if (fullUser?.avatarUrl && fullUser.avatarUrl.includes("cloudinary.com")) {
      const oldPublicId = extractPublicId(fullUser.avatarUrl);
      if (oldPublicId) {
        try {
          await deleteImage(oldPublicId);
        } catch {
          // Non-fatal
        }
      }
    }

    // Update user with new avatar
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: uploaded.url },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        isVerified: true,
        avatarUrl: true,
        location: true,
        createdAt: true,
      },
    });

    return success(updated);
  } catch (err) {
    console.error("Avatar upload error:", err);
    return error("Avatar upload failed", 500);
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true },
    });

    if (fullUser?.avatarUrl && fullUser.avatarUrl.includes("cloudinary.com")) {
      const publicId = extractPublicId(fullUser.avatarUrl);
      if (publicId) {
        try {
          await deleteImage(publicId);
        } catch {
          // Non-fatal
        }
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: null },
    });

    return success({ avatarUrl: null });
  } catch (err) {
    console.error("Avatar delete error:", err);
    return error("Failed to remove avatar", 500);
  }
}
