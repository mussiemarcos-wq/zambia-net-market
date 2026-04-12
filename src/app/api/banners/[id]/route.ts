import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden, notFound } from "@/lib/api";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden();

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.bannerAd.findUnique({ where: { id } });
    if (!existing) return notFound("Banner not found");

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;
    if (body.targetUrl !== undefined) data.targetUrl = body.targetUrl;
    if (body.placement !== undefined) data.placement = body.placement;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const updated = await prisma.bannerAd.update({
      where: { id },
      data,
    });

    return success(updated);
  } catch (err) {
    console.error("PUT /api/banners/[id] error:", err);
    return error("Failed to update banner", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden();

    const { id } = await params;

    const existing = await prisma.bannerAd.findUnique({ where: { id } });
    if (!existing) return notFound("Banner not found");

    await prisma.bannerAd.delete({ where: { id } });

    return success({ message: "Banner deleted" });
  } catch (err) {
    console.error("DELETE /api/banners/[id] error:", err);
    return error("Failed to delete banner", 500);
  }
}
