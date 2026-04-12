import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api";

export async function POST(req: NextRequest) {
  // Allow either admin user or CRON_SECRET header
  const cronSecret = req.headers.get("x-cron-secret");
  const isAuthedViaCron =
    cronSecret && process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET;

  if (!isAuthedViaCron) {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden();
  }

  const now = new Date();

  const [expiredBoosts, expiredFeatures] = await Promise.all([
    prisma.listing.updateMany({
      where: {
        isBoosted: true,
        boostExpires: { lt: now },
      },
      data: { isBoosted: false },
    }),
    prisma.listing.updateMany({
      where: {
        isFeatured: true,
        featureExpires: { lt: now },
      },
      data: { isFeatured: false },
    }),
  ]);

  return success({
    expiredBoosts: expiredBoosts.count,
    expiredFeatures: expiredFeatures.count,
  });
}
