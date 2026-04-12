import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api";
import { initializePayment } from "@/lib/paystack";
import { SPONSORED_CATEGORY_PLANS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");

  const now = new Date();

  const where: Record<string, unknown> = {
    placement: categorySlug
      ? `sponsor_${categorySlug}`
      : { startsWith: "sponsor_" },
    startsAt: { lte: now },
    expiresAt: { gte: now },
    isActive: true,
  };

  const sponsorships = await prisma.bannerAd.findMany({
    where,
    include: {
      advertiser: {
        select: {
          id: true,
          name: true,
          businessProfile: {
            select: {
              businessName: true,
              logoUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = sponsorships.map((s) => ({
    id: s.id,
    placement: s.placement,
    startsAt: s.startsAt.toISOString(),
    expiresAt: s.expiresAt.toISOString(),
    businessName:
      s.advertiser.businessProfile?.businessName || s.advertiser.name,
    logoUrl: s.advertiser.businessProfile?.logoUrl || null,
    advertiserId: s.advertiser.id,
  }));

  return success({ sponsorships: formatted });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { planId, categorySlug } = body as {
    planId: string;
    categorySlug?: string;
  };

  if (!planId) {
    return error("planId is required");
  }

  const plan = SPONSORED_CATEGORY_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return error("Invalid sponsorship plan");
  }

  // Determine placement
  const placement = planId === "sponsor_homepage"
    ? "sponsor_homepage"
    : categorySlug
      ? `sponsor_${categorySlug}`
      : null;

  if (!placement) {
    return error("categorySlug is required for category sponsorship plans");
  }

  // Check for existing active sponsorship on this placement
  const existing = await prisma.bannerAd.findFirst({
    where: {
      placement,
      expiresAt: { gte: new Date() },
      isActive: true,
    },
  });

  if (existing) {
    return error("This placement already has an active sponsorship");
  }

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      type: "BANNER",
      amount: plan.price,
      currency: "ZMW",
      status: "PENDING",
      provider: "dpo",
      metadata: {
        planId,
        placement,
        type: "SPONSORSHIP",
        planDays: plan.days,
      },
    },
  });

  const email = user.email || `${user.phone}@zambia-net-market.com`;
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payments/callback`;

  const paystackRes = await initializePayment({
    email,
    amount: plan.priceNgwee,
    reference: payment.id,
    callbackUrl,
    metadata: {
      paymentId: payment.id,
      type: "SPONSORSHIP",
      planId,
      placement,
    },
  });

  if (!paystackRes.status) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return error("Failed to initialize payment: " + paystackRes.message, 500);
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { providerRef: paystackRes.data.access_code },
  });

  return success({
    authorizationUrl: paystackRes.data.authorization_url,
    reference: payment.id,
  });
}
