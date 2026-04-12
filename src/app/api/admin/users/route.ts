import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, unauthorized, error } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return error("Forbidden", 403);
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          isVerified: true,
          isBanned: true,
          createdAt: true,
          location: true,
          _count: {
            select: { listings: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [totalUsers, verifiedUsers, bannedUsers, newThisWeek] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isVerified: true } }),
        prisma.user.count({ where: { isBanned: true } }),
        prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      ]);

    const serialized = users.map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      email: u.email,
      role: u.role,
      isVerified: u.isVerified,
      isBanned: u.isBanned,
      createdAt: u.createdAt.toISOString(),
      location: u.location,
      listingsCount: u._count.listings,
    }));

    return success({
      users: serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        totalUsers,
        verifiedUsers,
        bannedUsers,
        newThisWeek,
      },
    });
  } catch (err) {
    console.error("GET /api/admin/users error:", err);
    return error("Failed to fetch users", 500);
  }
}
