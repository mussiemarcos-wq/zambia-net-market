import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Find the property category
    const propertyCategory = await prisma.category.findFirst({
      where: { slug: "property" },
    });

    if (!propertyCategory) {
      return success({ agents: [], total: 0, page, totalPages: 0 });
    }

    // Build the where clause for users who have active property listings AND a business profile
    const where = {
      businessProfile: { isNot: null },
      listings: {
        some: {
          categoryId: propertyCategory.id,
          status: "ACTIVE" as const,
        },
      },
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { location: { contains: search, mode: "insensitive" as const } },
              {
                businessProfile: {
                  businessName: { contains: search, mode: "insensitive" as const },
                },
              },
            ],
          }
        : {}),
    };

    const [agents, total] = await Promise.all([
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
                  categoryId: propertyCategory.id,
                  status: "ACTIVE",
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: [{ isVerified: "desc" }, { name: "asc" }],
      }),
      prisma.user.count({ where }),
    ]);

    const formattedAgents = agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      avatarUrl: agent.avatarUrl,
      isVerified: agent.isVerified,
      location: agent.location,
      businessName: agent.businessProfile?.businessName || null,
      listingCount: agent._count.listings,
    }));

    return success({
      agents: formattedAgents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching agents:", err);
    return error("Failed to fetch agents", 500);
  }
}
