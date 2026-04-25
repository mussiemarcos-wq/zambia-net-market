import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api";
import { normalisePhone, verifyOtpHash } from "@/lib/whatsapp-otp";

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = (body.phone || "").toString().trim();
    const code = (body.code || "").toString().trim();

    if (!phone || !code) {
      return error("Phone and code are required");
    }

    if (!/^\d{6}$/.test(code)) {
      return error("Code must be 6 digits");
    }

    const cleanPhone = normalisePhone(phone);

    // Find latest unverified, unexpired OTP for this phone
    const verification = await prisma.phoneVerification.findFirst({
      where: {
        phone: cleanPhone,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return error(
        "No active verification code found. Please request a new one.",
        404
      );
    }

    if (verification.attempts >= MAX_ATTEMPTS) {
      return error(
        "Too many attempts. Please request a new code.",
        429
      );
    }

    // Verify code (timing-safe)
    const isValid = verifyOtpHash(code, cleanPhone, verification.codeHash);

    if (!isValid) {
      await prisma.phoneVerification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      return error("Invalid verification code");
    }

    // Mark verification as complete
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() },
    });

    // Mark user as verified (find user by their original phone, with or without +)
    // The User.phone field stores original format like "+260974094000"
    // The verification table stores cleaned format like "260974094000"
    const updated = await prisma.user.updateMany({
      where: {
        OR: [
          { phone: `+${cleanPhone}` },
          { phone: cleanPhone },
        ],
      },
      data: {
        isPhoneVerified: true,
        phoneVerifiedAt: new Date(),
      },
    });

    return success({
      message: "Phone verified successfully",
      userUpdated: updated.count > 0,
    });
  } catch (err) {
    console.error("verify-otp error:", err);
    return error("Failed to verify code", 500);
  }
}
