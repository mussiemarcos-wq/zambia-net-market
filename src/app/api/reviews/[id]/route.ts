import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden, notFound } from "@/lib/api";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const review = await prisma.review.findUnique({
      where: { id },
      select: { id: true, reviewerId: true },
    });

    if (!review) return notFound("Review not found");

    const isReviewer = review.reviewerId === user.id;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    if (!isReviewer && !isAdmin) {
      return forbidden("You can only delete your own reviews");
    }

    await prisma.review.delete({ where: { id } });

    return success({ message: "Review deleted" });
  } catch (err) {
    console.error("Review DELETE error:", err);
    return error("Failed to delete review", 500);
  }
}
