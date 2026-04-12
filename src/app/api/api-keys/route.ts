import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { unauthorized } from "@/lib/api";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const API_KEY_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

function generateApiKey(userId: string): string {
  const hash = crypto
    .createHmac("sha256", API_KEY_SECRET)
    .update(userId)
    .digest("hex")
    .slice(0, 32);
  return `zmkt_${hash}`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const apiKey = generateApiKey(user.id);

  return NextResponse.json({
    apiKey,
    createdFor: user.name,
    usage: {
      callsThisMonth: 0,
      limit: "Based on your plan",
    },
  });
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const apiKey = generateApiKey(user.id);

  return NextResponse.json({
    apiKey,
    message: "API key generated successfully. Keep it secure and do not share it publicly.",
  });
}
