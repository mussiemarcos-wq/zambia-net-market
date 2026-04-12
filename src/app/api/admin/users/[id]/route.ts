import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, unauthorized, error, notFound } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      return error("Forbidden", 403);
    }

    const { id } = await context.params;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!targetUser) return notFound("User not found");

    // Cannot modify SUPER_ADMIN users unless you are SUPER_ADMIN
    if (
      targetUser.role === "SUPER_ADMIN" &&
      currentUser.role !== "SUPER_ADMIN"
    ) {
      return error("Cannot modify a SUPER_ADMIN user", 403);
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.role !== undefined) {
      const validRoles = ["MEMBER", "SELLER", "BUSINESS", "ADMIN", "SUPER_ADMIN"];
      if (!validRoles.includes(body.role)) {
        return error("Invalid role");
      }
      // Only SUPER_ADMIN can assign SUPER_ADMIN role
      if (body.role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
        return error("Only SUPER_ADMIN can assign SUPER_ADMIN role", 403);
      }
      data.role = body.role;
    }

    if (body.isBanned !== undefined) {
      data.isBanned = Boolean(body.isBanned);
    }

    if (body.isVerified !== undefined) {
      data.isVerified = Boolean(body.isVerified);
    }

    if (Object.keys(data).length === 0) {
      return error("No valid fields to update");
    }

    const updated = await prisma.user.update({
      where: { id },
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
      },
    data,
    });

    return success(updated);
  } catch (err) {
    console.error("PUT /api/admin/users/[id] error:", err);
    return error("Failed to update user", 500);
  }
}
