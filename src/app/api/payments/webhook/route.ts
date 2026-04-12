import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateWebhookSignature } from "@/lib/paystack";
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

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";

  if (!validateWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const data = event.data;
    const reference = data.reference as string;

    const payment = await prisma.payment.findUnique({
      where: { id: reference },
    });

    if (payment && payment.status !== "COMPLETED") {
      await prisma.payment.update({
        where: { id: reference },
        data: {
          status: "COMPLETED",
          providerRef: data.reference,
        },
      });

      const metadata = payment.metadata as Record<string, unknown>;
      await activatePayment(payment.id, metadata);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
