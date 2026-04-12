import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, unauthorized, forbidden } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden("Admin access required");

  // Total referrals across the platform
  const totalReferrals = await prisma.user.count({
    where: { referredBy: { not: null } },
  });

  // Total registered users
  const totalUsers = await prisma.user.count();

  // Referral conversion rate
  const conversionRate = totalUsers > 0 ? (totalReferrals / totalUsers) * 100 : 0;

  // Top 10 referrers
  const topReferrers = await prisma.user.findMany({
    where: { referralCount: { gt: 0 } },
    select: {
      name: true,
      referralCount: true,
    },
    orderBy: { referralCount: "desc" },
    take: 10,
  });

  return success({
    totalReferrals,
    totalUsers,
    conversionRate: Math.round(conversionRate * 100) / 100,
    topReferrers: topReferrers.map((u) => ({
      name: u.name,
      count: u.referralCount,
    })),
  });
}
