import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const profile = await prisma.businessProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return success({ profile: null });
  }

  return success({ profile });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const existing = await prisma.businessProfile.findUnique({
    where: { userId: user.id },
  });

  if (existing) {
    return error("Business profile already exists", 409);
  }

  const body = await req.json();
  const { businessName, description, website, operatingHours } = body;

  if (!businessName || typeof businessName !== "string" || !businessName.trim()) {
    return error("Business name is required");
  }

  const [profile] = await prisma.$transaction([
    prisma.businessProfile.create({
      data: {
        userId: user.id,
        businessName: businessName.trim(),
        description: description?.trim() || null,
        website: website?.trim() || null,
        operatingHours: operatingHours || null,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { role: "BUSINESS" },
    }),
  ]);

  return success({ profile }, 201);
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const existing = await prisma.businessProfile.findUnique({
    where: { userId: user.id },
  });

  if (!existing) {
    return error("No business profile found. Create one first.", 404);
  }

  const body = await req.json();
  const { businessName, description, website, operatingHours } = body;

  const profile = await prisma.businessProfile.update({
    where: { userId: user.id },
    data: {
      ...(businessName !== undefined && { businessName: businessName.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(website !== undefined && { website: website?.trim() || null }),
      ...(operatingHours !== undefined && { operatingHours }),
    },
  });

  return success({ profile });
}
