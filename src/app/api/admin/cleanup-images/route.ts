import { NextRequest } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { success, error, unauthorized } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Only admins can trigger cleanup, or use a secret key for cron jobs
    const cronSecret = request.headers.get("x-cron-secret");
    if (cronSecret !== process.env.CRON_SECRET) {
      const user = await getCurrentUser();
      if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        return unauthorized();
      }
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find images belonging to expired listings older than 30 days
    const expiredImages = await prisma.listingImage.findMany({
      where: {
        listing: {
          OR: [
            { status: "EXPIRED", updatedAt: { lt: thirtyDaysAgo } },
            { status: "REMOVED", updatedAt: { lt: thirtyDaysAgo } },
            { expiresAt: { lt: thirtyDaysAgo } },
          ],
        },
      },
      select: { id: true, url: true },
    });

    let deleted = 0;
    let failed = 0;

    for (const image of expiredImages) {
      // Delete file from disk
      try {
        const filepath = path.join(process.cwd(), "public", image.url);
        await unlink(filepath);
      } catch {
        // File may already be gone
      }

      // Delete from database
      try {
        await prisma.listingImage.delete({ where: { id: image.id } });
        deleted++;
      } catch {
        failed++;
      }
    }

    return success({
      message: `Cleanup complete. ${deleted} images deleted, ${failed} failed.`,
      deleted,
      failed,
      total: expiredImages.length,
    });
  } catch (err) {
    console.error("Cleanup error:", err);
    return error("Cleanup failed", 500);
  }
}
