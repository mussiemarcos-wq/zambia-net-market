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

  // Extract service-specific data from operatingHours JSON
  const operatingHours =
    (profile.operatingHours as Record<string, unknown>) || {};
  const serviceData = {
    serviceArea: operatingHours.serviceArea || null,
    yearsExperience: operatingHours.yearsExperience || null,
    specialties: operatingHours.specialties || [],
    leadNotifications: operatingHours.leadNotifications !== false,
  };

  return success({
    profile: {
      id: profile.id,
      businessName: profile.businessName,
      description: profile.description,
      website: profile.website,
      subscriptionTier: profile.subscriptionTier,
      subscriptionExpires: profile.subscriptionExpires,
      ...serviceData,
    },
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { serviceArea, yearsExperience, specialties, leadNotifications } = body;

  let profile = await prisma.businessProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    // Create a basic business profile if none exists
    profile = await prisma.businessProfile.create({
      data: {
        userId: user.id,
        businessName: user.name,
        operatingHours: {
          serviceArea: serviceArea || null,
          yearsExperience: yearsExperience || null,
          specialties: specialties || [],
          leadNotifications: leadNotifications !== false,
        },
      },
    });

    return success({ profile }, 201);
  }

  // Merge new service data into existing operatingHours
  const existingHours =
    (profile.operatingHours as Record<string, unknown>) || {};
  const updatedHours = {
    ...existingHours,
    ...(serviceArea !== undefined && { serviceArea }),
    ...(yearsExperience !== undefined && { yearsExperience }),
    ...(specialties !== undefined && { specialties }),
    ...(leadNotifications !== undefined && { leadNotifications }),
  };

  const updated = await prisma.businessProfile.update({
    where: { userId: user.id },
    data: { operatingHours: updatedHours },
  });

  return success({ profile: updated });
}
