import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error, notFound } from "@/lib/api";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const banner = await prisma.bannerAd.findUnique({ where: { id } });
    if (!banner) return notFound("Banner not found");

    await prisma.bannerAd.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });

    return success({ message: "Click recorded" });
  } catch (err) {
    console.error("POST /api/banners/[id]/click error:", err);
    return error("Failed to record click", 500);
  }
}
