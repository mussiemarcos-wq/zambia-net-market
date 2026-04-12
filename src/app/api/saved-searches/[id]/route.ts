import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden, notFound } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await context.params;

    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!savedSearch) return notFound("Saved search not found");
    if (savedSearch.userId !== user.id) return forbidden("You can only delete your own saved searches");

    await prisma.savedSearch.delete({ where: { id } });

    return success({ message: "Saved search removed" });
  } catch (err) {
    console.error("DELETE /api/saved-searches/[id] error:", err);
    return error("Failed to delete saved search", 500);
  }
}

export async function PUT(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await context.params;

    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id },
      select: { userId: true, isActive: true },
    });

    if (!savedSearch) return notFound("Saved search not found");
    if (savedSearch.userId !== user.id) return forbidden("You can only update your own saved searches");

    const updated = await prisma.savedSearch.update({
      where: { id },
      data: { isActive: !savedSearch.isActive },
    });

    return success({
      id: updated.id,
      isActive: updated.isActive,
    });
  } catch (err) {
    console.error("PUT /api/saved-searches/[id] error:", err);
    return error("Failed to update saved search", 500);
  }
}
