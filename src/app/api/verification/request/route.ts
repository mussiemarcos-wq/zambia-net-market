import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  if (user.isVerified) {
    return error("You are already verified");
  }

  const pendingRequest = await prisma.verificationRequest.findFirst({
    where: {
      userId: user.id,
      status: "PENDING",
    },
  });

  if (pendingRequest) {
    return error("You already have a pending verification request");
  }

  const request = await prisma.verificationRequest.create({
    data: {
      userId: user.id,
      status: "PENDING",
    },
  });

  return success({ request }, 201);
}
