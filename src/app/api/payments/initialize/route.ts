import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api";
import { initializePayment } from "@/lib/paystack";
import { BOOST_PLANS, FEATURE_PLANS, VERIFICATION_FEE } from "@/lib/constants";
import { PaymentType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { type, planId, listingId } = body as {
    type: string;
    planId: string;
    listingId?: string;
  };

  if (!type || !planId) {
    return error("type and planId are required");
  }

  const validTypes: PaymentType[] = ["BOOST", "FEATURE", "SUBSCRIPTION", "VERIFICATION"];
  if (!validTypes.includes(type as PaymentType)) {
    return error("Invalid payment type");
  }

  let amount: number;
  let planDays: number | undefined;

  if (type === "BOOST" || type === "FEATURE") {
    if (!listingId) {
      return error("listingId is required for BOOST/FEATURE payments");
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return error("Listing not found", 404);
    }

    if (listing.userId !== user.id) {
      return error("You can only boost/feature your own listings", 403);
    }

    const plans = type === "BOOST" ? BOOST_PLANS : FEATURE_PLANS;
    const plan = plans.find((p) => p.id === planId);

    if (!plan) {
      return error("Invalid plan selected");
    }

    amount = plan.priceNgwee;
    planDays = plan.days;
  } else if (type === "VERIFICATION") {
    amount = VERIFICATION_FEE.priceNgwee;
  } else {
    // SUBSCRIPTION - handled elsewhere or extend later
    return error("Subscription payments are not yet supported via this endpoint");
  }

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      type: type as PaymentType,
      amount: amount / 100, // Store in ZMW, not ngwee
      currency: "ZMW",
      status: "PENDING",
      provider: "dpo",
      metadata: {
        planId,
        listingId: listingId || null,
        type,
        planDays: planDays || null,
      },
    },
  });

  const email = user.email || `${user.phone}@zambia-net-market.com`;
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payments/callback`;

  const paystackRes = await initializePayment({
    email,
    amount,
    reference: payment.id,
    callbackUrl,
    metadata: {
      paymentId: payment.id,
      type,
      planId,
      listingId: listingId || null,
    },
  });

  if (!paystackRes.status) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return error("Failed to initialize payment: " + paystackRes.message, 500);
  }

  // Store DPO transToken as providerRef for verification
  await prisma.payment.update({
    where: { id: payment.id },
    data: { providerRef: paystackRes.data.access_code },
  });

  return success({
    authorizationUrl: paystackRes.data.authorization_url,
    reference: payment.id,
  });
}
