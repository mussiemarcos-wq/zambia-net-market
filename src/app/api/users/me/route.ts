import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  return success(user);
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const { name, email, location, avatarUrl } = body;

  if (name !== undefined && !name.trim()) {
    return error("Name cannot be empty");
  }

  if (email !== undefined) {
    const existing = await prisma.user.findFirst({
      where: {
        email,
        id: { not: user.id },
      },
    });

    if (existing) {
      return error("Email is already in use");
    }
  }

  const data: Record<string, string> = {};
  if (name !== undefined) data.name = name.trim();
  if (email !== undefined) data.email = email;
  if (location !== undefined) data.location = location;
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      isVerified: true,
      avatarUrl: true,
      location: true,
      createdAt: true,
    },
  });

  return success(updated);
}
