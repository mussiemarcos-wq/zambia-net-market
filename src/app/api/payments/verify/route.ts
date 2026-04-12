import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api";
import { verifyPayment } from "@/lib/paystack";
import { BOOST_PLANS, FEATURE_PLANS } from "@/lib/constants";

async function activatePayment(paymentId: string, metadata: Record<string, unknown>) {
  const type = metadata.type as string;
  const listingId = metadata.listingId as string | null;
  const planId = metadata.planId as string;

  if (type === "BOOST" && listingId) {
    const plan = BOOST_PLANS.find((p) => p.id === planId);
    if (plan) {
      const boostExpires = new Date();
      boostExpires.setDate(boostExpires.getDate() + plan.days);
      await prisma.listing.update({
        where: { id: listingId },
        data: { isBoosted: true, boostExpires },
      });
    }
  } else if (type === "FEATURE" && listingId) {
    const plan = FEATURE_PLANS.find((p) => p.id === planId);
    if (plan) {
      const featureExpires = new Date();
      featureExpires.setDate(featureExpires.getDate() + plan.days);
      await prisma.listing.update({
        where: { id: listingId },
        data: { isFeatured: true, featureExpires },
      });
    }
  } else if (type === "VERIFICATION") {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { userId: true },
    });

    if (payment) {
      // Upsert: create or update verification request to PENDING
      const existing = await prisma.verificationRequest.findFirst({
        where: { userId: payment.userId },
      });

      if (existing) {
        await prisma.verificationRequest.update({
          where: { id: existing.id },
          data: { status: "PENDING", paymentId },
        });
      } else {
        await prisma.verificationRequest.create({
          data: {
            userId: payment.userId,
            status: "PENDING",
            paymentId,
          },
        });
      }
    }
  }
}

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");

  if (!reference) {
    return error("reference query parameter is required");
  }

  const payment = await prisma.payment.findUnique({
    where: { id: reference },
  });

  if (!payment) {
    return error("Payment not found", 404);
  }

  if (payment.status === "COMPLETED") {
    const metadata = payment.metadata as Record<string, unknown>;
    return success({
      success: true,
      type: metadata.type,
      listingId: metadata.listingId || null,
    });
  }

  const paystackRes = await verifyPayment(reference);

  if (!paystackRes.status || paystackRes.data.status !== "success") {
    await prisma.payment.update({
      where: { id: reference },
      data: { status: "FAILED" },
    });
    return error("Payment verification failed");
  }

  await prisma.payment.update({
    where: { id: reference },
    data: {
      status: "COMPLETED",
      providerRef: paystackRes.data.reference,
    },
  });

  const metadata = payment.metadata as Record<string, unknown>;
  await activatePayment(payment.id, metadata);

  return success({
    success: true,
    type: metadata.type,
    listingId: metadata.listingId || null,
  });
}
