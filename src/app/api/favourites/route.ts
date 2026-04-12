import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error, unauthorized } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const [favourites, total] = await Promise.all([
      prisma.favourite.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              priceType: true,
              condition: true,
              location: true,
              status: true,
              createdAt: true,
              images: {
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: {
                  id: true,
                  url: true,
                  thumbnailUrl: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      }),
      prisma.favourite.count({ where: { userId: user.id } }),
    ]);

    return success({
      data: favourites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Failed to fetch favourites:", err);
    return error("Failed to fetch favourites", 500);
  }
}
