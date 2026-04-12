import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      referralCode: true,
      referralCount: true,
    },
  });

  if (!fullUser) return unauthorized();

  // Get list of referred users (non-sensitive data only)
  const referredUsers = await prisma.user.findMany({
    where: { referredBy: user.id },
    select: {
      name: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const referralLink = `${appUrl}?ref=${fullUser.referralCode}`;

  return success({
    referralCode: fullUser.referralCode,
    referralLink,
    referralCount: fullUser.referralCount,
    referredUsers: referredUsers.map((u) => ({
      name: u.name,
      createdAt: u.createdAt.toISOString(),
    })),
  });
}
