import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const placement = req.nextUrl.searchParams.get("placement") || "homepage";
    const now = new Date();

    const banners = await prisma.bannerAd.findMany({
      where: {
        isActive: true,
        placement,
        startsAt: { lte: now },
        expiresAt: { gt: now },
      },
      orderBy: { impressions: "asc" },
      take: 5,
    });

    if (banners.length === 0) {
      return success({ banner: null });
    }

    // Pick a random banner from the lowest-impression ones for even distribution
    const banner = banners[Math.floor(Math.random() * banners.length)];

    // Increment impressions
    await prisma.bannerAd.update({
      where: { id: banner.id },
      data: { impressions: { increment: 1 } },
    });

    return success({
      banner: {
        id: banner.id,
        title: banner.title,
        imageUrl: banner.imageUrl,
        targetUrl: banner.targetUrl,
        placement: banner.placement,
      },
    });
  } catch (err) {
    console.error("GET /api/banners error:", err);
    return error("Failed to fetch banners", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden();

    const body = await req.json();
    const { title, imageUrl, targetUrl, placement, startsAt, expiresAt } = body;

    if (!title || !imageUrl || !targetUrl) {
      return error("Title, image URL, and target URL are required");
    }

    const start = new Date(startsAt || Date.now());
    const end = new Date(expiresAt);

    if (!expiresAt || isNaN(end.getTime())) {
      return error("Valid expiry date is required");
    }

    if (end <= start) {
      return error("Expiry date must be after start date");
    }

    const banner = await prisma.bannerAd.create({
      data: {
        advertiserId: user.id,
        title,
        imageUrl,
        targetUrl,
        placement: placement || "homepage",
        startsAt: start,
        expiresAt: end,
        isActive: true,
        impressions: 0,
        clicks: 0,
      },
    });

    return success(banner, 201);
  } catch (err) {
    console.error("POST /api/banners error:", err);
    return error("Failed to create banner", 500);
  }
}
