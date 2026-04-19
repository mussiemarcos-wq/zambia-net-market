import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { success, error } from "@/lib/api";
import { checkAndGrantRewards } from "@/lib/referral-rewards";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function getUniqueReferralCode(): Promise<string> {
  let code = generateReferralCode();
  let exists = await prisma.user.findUnique({ where: { referralCode: code } });
  while (exists) {
    code = generateReferralCode();
    exists = await prisma.user.findUnique({ where: { referralCode: code } });
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, password, email, location, referralCode } = body;

    // Validate required fields
    if (!name || !phone || !password) {
      return error("Name, phone, and password are required");
    }

    // Check phone uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return error("Phone number already registered", 409);
    }

    // Check email uniqueness if provided
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return error("Email already registered", 409);
      }
    }

    // Look up referrer if referral code provided
    let referrerId: string | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.toUpperCase() },
        select: { id: true },
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        passwordHash,
        email: email || null,
        location: location || null,
        referredBy: referrerId,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        isVerified: true,
        avatarUrl: true,
        location: true,
        createdAt: true,
      },
    });

    // Generate unique referral code for the new user
    const newReferralCode = await getUniqueReferralCode();
    await prisma.user.update({
      where: { id: user.id },
      data: { referralCode: newReferralCode },
    });

    // If referred by someone, increment their referral count and check rewards
    if (referrerId) {
      const updatedReferrer = await prisma.user.update({
        where: { id: referrerId },
        data: { referralCount: { increment: 1 } },
        select: { referralCount: true },
      });
      await checkAndGrantRewards(referrerId, updatedReferrer.referralCount, prisma);
    }

    // Sign JWT and set cookie
    const token = signToken({ userId: user.id, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return success(user, 201);
  } catch (err) {
    console.error("Registration error:", err);
    return error("Internal server error", 500);
  }
}
