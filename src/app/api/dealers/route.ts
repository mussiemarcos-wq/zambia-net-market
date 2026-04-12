import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success } from "@/lib/api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  // Find the vehicles category
  const vehiclesCategory = await prisma.category.findFirst({
    where: { slug: "vehicles" },
  });

  if (!vehiclesCategory) {
    return success({ dealers: [], total: 0, page, totalPages: 0 });
  }

  // Build where clause
  const where: Record<string, unknown> = {
    businessProfile: { isNot: null },
    listings: {
      some: {
        categoryId: vehiclesCategory.id,
        status: "ACTIVE",
      },
    },
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
      {
        businessProfile: {
          businessName: { contains: search, mode: "insensitive" },
        },
      },
    ];
  }

  const [dealers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        isVerified: true,
        location: true,
        businessProfile: {
          select: {
            businessName: true,
          },
        },
        _count: {
          select: {
            listings: {
              where: {
                categoryId: vehiclesCategory.id,
                status: "ACTIVE",
              },
            },
          },
        },
      },
      orderBy: [{ isVerified: "desc" }, { name: "asc" }],
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const formatted = dealers.map((d) => ({
    id: d.id,
    name: d.name,
    avatarUrl: d.avatarUrl,
    isVerified: d.isVerified,
    location: d.location,
    businessName: d.businessProfile?.businessName || null,
    vehicleCount: d._count.listings,
  }));

  return success({
    dealers: formatted,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
