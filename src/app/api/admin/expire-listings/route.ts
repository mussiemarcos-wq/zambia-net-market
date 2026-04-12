import { NextRequest } from "next/server";
import { ListingStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api";

export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get("x-cron-secret");
  const isAuthorizedByCron =
    cronSecret && process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET;

  if (!isAuthorizedByCron) {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden("Admin access required");
  }

  const now = new Date();

  const result = await prisma.listing.updateMany({
    where: {
      status: ListingStatus.ACTIVE,
      expiresAt: { lt: now },
    },
    data: {
      status: ListingStatus.EXPIRED,
    },
  });

  return success({ expiredCount: result.count });
}
