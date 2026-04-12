import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, unauthorized, error } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return error("Forbidden", 403);
  }

  const completedPayments = await prisma.payment.findMany({
    where: { status: "COMPLETED" },
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = completedPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  // Group by type
  const revenueByTypeMap = new Map<
    string,
    { type: string; total: number; count: number }
  >();
  for (const p of completedPayments) {
    const existing = revenueByTypeMap.get(p.type) || {
      type: p.type,
      total: 0,
      count: 0,
    };
    existing.total += Number(p.amount);
    existing.count += 1;
    revenueByTypeMap.set(p.type, existing);
  }
  const revenueByType = Array.from(revenueByTypeMap.values());

  const recentPayments = completedPayments.slice(0, 20).map((p) => ({
    id: p.id,
    type: p.type,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    userName: p.user.name,
    createdAt: p.createdAt,
  }));

  return success({
    totalRevenue,
    revenueByType,
    recentPayments,
  });
}
