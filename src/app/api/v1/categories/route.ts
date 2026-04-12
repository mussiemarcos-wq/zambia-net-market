import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function validateApiKey(request: NextRequest): Promise<boolean> {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) return false;
  if (!apiKey.startsWith("zmkt_") || apiKey.length < 20) return false;
  console.log(`[API] v1/categories accessed with key: ${apiKey.slice(0, 10)}...`);
  return true;
}

export async function GET(request: NextRequest) {
  const isValid = await validateApiKey(request);
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid or missing API key. Include x-api-key header." },
      { status: 401 }
    );
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      subcategories: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: { sortOrder: "asc" },
      },
      _count: {
        select: {
          listings: {
            where: { status: "ACTIVE" },
          },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const data = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    listingCount: c._count.listings,
    subcategories: c.subcategories,
  }));

  return NextResponse.json({ data });
}
