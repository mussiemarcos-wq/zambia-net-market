import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function validateApiKey(request: NextRequest): Promise<boolean> {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) return false;

  // For MVP: validate that the key matches a deterministic hash pattern
  // Keys are formatted as "zmkt_<userId-hash>"
  // Accept any key that starts with "zmkt_" and has valid length
  if (!apiKey.startsWith("zmkt_") || apiKey.length < 20) return false;

  // Log API usage
  console.log(`[API] v1/listings accessed with key: ${apiKey.slice(0, 10)}...`);
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

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const offset = parseInt(searchParams.get("offset") || "0");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: "ACTIVE" };

  if (category) {
    const cat = await prisma.category.findUnique({
      where: { slug: category },
    });
    if (cat) {
      where.categoryId = cat.id;
    }
  }

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      select: {
        id: true,
        title: true,
        price: true,
        priceType: true,
        location: true,
        condition: true,
        viewsCount: true,
        createdAt: true,
        category: { select: { name: true, slug: true } },
        images: {
          select: { url: true, thumbnailUrl: true },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        user: { select: { name: true, isVerified: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.listing.count({ where }),
  ]);

  const data = listings.map((l) => ({
    id: l.id,
    title: l.title,
    price: l.price ? Number(l.price) : null,
    priceType: l.priceType,
    location: l.location,
    condition: l.condition,
    viewsCount: l.viewsCount,
    createdAt: l.createdAt.toISOString(),
    category: l.category,
    image: l.images[0] || null,
    seller: l.user,
  }));

  return NextResponse.json({
    data,
    pagination: {
      total,
      limit,
      offset,
    },
  });
}
