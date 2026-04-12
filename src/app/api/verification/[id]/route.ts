import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden, notFound } from "@/lib/api";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return forbidden("Only admins can review verification requests");
  }

  const { id } = await params;

  const verificationRequest = await prisma.verificationRequest.findUnique({
    where: { id },
  });

  if (!verificationRequest) {
    return notFound("Verification request not found");
  }

  const body = await req.json();
  const { status, adminNote } = body;

  if (status !== "APPROVED" && status !== "REJECTED") {
    return error("Status must be APPROVED or REJECTED");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.verificationRequest.update({
      where: { id },
      data: {
        status,
        adminNote: adminNote || null,
      },
    });

    if (status === "APPROVED") {
      await tx.user.update({
        where: { id: verificationRequest.userId },
        data: { isVerified: true },
      });
    }

    return updatedRequest;
  });

  return success({ request: updated });
}
