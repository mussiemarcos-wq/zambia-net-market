import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api";
import {
  generateOtpCode,
  hashOtpCode,
  normalisePhone,
  sendWhatsAppOtp,
} from "@/lib/whatsapp-otp";

const OTP_EXPIRY_MINUTES = 10;
const RATE_LIMIT_MINUTES = 1; // Wait 1 min between OTP requests
const MAX_OTPS_PER_DAY = 5; // Per phone number

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = (body.phone || "").toString().trim();

    if (!phone || phone.length < 8) {
      return error("Valid phone number is required");
    }

    const cleanPhone = normalisePhone(phone);
    if (cleanPhone.length < 8) {
      return error("Valid phone number is required");
    }

    // Rate limiting: check recent OTP requests for this phone
    const oneMinAgo = new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000);
    const recent = await prisma.phoneVerification.findFirst({
      where: {
        phone: cleanPhone,
        createdAt: { gte: oneMinAgo },
      },
      orderBy: { createdAt: "desc" },
    });
    if (recent) {
      return error(
        "Please wait a minute before requesting another code",
        429
      );
    }

    // Daily cap
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyCount = await prisma.phoneVerification.count({
      where: {
        phone: cleanPhone,
        createdAt: { gte: oneDayAgo },
      },
    });
    if (dailyCount >= MAX_OTPS_PER_DAY) {
      return error(
        `You have requested too many codes today. Please try again tomorrow.`,
        429
      );
    }

    // Generate and store OTP
    const code = generateOtpCode();
    const codeHash = hashOtpCode(code, cleanPhone);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.phoneVerification.create({
      data: {
        phone: cleanPhone,
        codeHash,
        expiresAt,
      },
    });

    // Send via WhatsApp
    const result = await sendWhatsAppOtp(cleanPhone, code);
    if (!result.success) {
      return error(result.error || "Could not send verification code", 500);
    }

    return success({
      message: "Verification code sent via WhatsApp",
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (err) {
    console.error("send-otp error:", err);
    return error("Failed to send verification code", 500);
  }
}
