import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, notFound } from "@/lib/api";
import { ReportReason } from "@prisma/client";

const VALID_REASONS: string[] = Object.values(ReportReason);

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await context.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!listing) return notFound("Listing not found");

    const body = await request.json();
    const { reason, description } = body;

    if (!reason || !VALID_REASONS.includes(reason)) {
      return error(
        `Invalid reason. Must be one of: ${VALID_REASONS.join(", ")}`
      );
    }

    // Prevent duplicate reports from the same user on the same listing
    const existing = await prisma.report.findFirst({
      where: {
        reporterId: user.id,
        listingId: id,
        status: "PENDING",
      },
    });

    if (existing) {
      return error("You have already reported this listing", 409);
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        listingId: id,
        reason: reason as ReportReason,
        description: description || null,
      },
    });

    return success(report, 201);
  } catch (err) {
    console.error("POST /api/listings/[id]/report error:", err);
    return error("Failed to submit report", 500);
  }
}
