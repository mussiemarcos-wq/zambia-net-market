import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return error("Current password and new password are required");
  }

  if (newPassword.length < 6) {
    return error("New password must be at least 6 characters");
  }

  // Fetch the user's password hash
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!dbUser) {
    return error("User not found", 404);
  }

  // Verify current password
  const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);
  if (!isValid) {
    return error("Current password is incorrect");
  }

  // Hash and update the new password
  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return success({ message: "Password changed successfully" });
}
