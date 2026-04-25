// WhatsApp Cloud API integration for sending OTP verification codes.
// Setup: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
//
// Required env vars:
// - WHATSAPP_PHONE_NUMBER_ID  (the sender's phone ID from Meta)
// - WHATSAPP_ACCESS_TOKEN     (long-lived access token from Meta)
// - WHATSAPP_OTP_TEMPLATE     (optional, defaults to "verification_code")

import crypto from "crypto";

const WHATSAPP_API_VERSION = "v21.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
const TEMPLATE_NAME = process.env.WHATSAPP_OTP_TEMPLATE || "verification_code";

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Generates a random 6-digit OTP code.
 */
export function generateOtpCode(): string {
  // Use crypto for unpredictability
  const buf = crypto.randomBytes(4);
  const num = buf.readUInt32BE(0) % 1000000;
  return num.toString().padStart(6, "0");
}

/**
 * Hashes the OTP code so we never store plaintext codes in the DB.
 */
export function hashOtpCode(code: string, phone: string): string {
  // Use a salt that includes the phone number
  const secret = process.env.JWT_SECRET || "dev-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`${phone}:${code}`)
    .digest("hex");
}

export function verifyOtpHash(code: string, phone: string, hash: string): boolean {
  const expected = hashOtpCode(code, phone);
  // Timing-safe comparison
  if (expected.length !== hash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash));
}

/**
 * Normalises a phone number to E.164 format (digits only, no +).
 * "+260 974 094 000" -> "260974094000"
 */
export function normalisePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Sends an OTP code via WhatsApp Cloud API using a pre-approved template message.
 *
 * The template "verification_code" must be created and approved in Meta Business Manager
 * with one body parameter: {{1}} for the 6-digit code.
 *
 * Falls back to a plain-text message if no template is configured (will only work
 * if the user has messaged the business in the last 24h, so this is mainly for dev).
 */
export async function sendWhatsAppOtp(
  phone: string,
  code: string
): Promise<SendOtpResult> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.error(
      "[whatsapp-otp] Missing env vars WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN"
    );
    return {
      success: false,
      error: "WhatsApp OTP service is not configured",
    };
  }

  const cleanPhone = normalisePhone(phone);

  // Try template message (production-ready path)
  const templatePayload = {
    messaging_product: "whatsapp",
    to: cleanPhone,
    type: "template",
    template: {
      name: TEMPLATE_NAME,
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: code }],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: code }],
        },
      ],
    },
  };

  try {
    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templatePayload),
    });
    const data = await res.json();

    if (!res.ok) {
      console.error("[whatsapp-otp] API error:", data);
      // Fallback: try plain text (works only if user is in 24h conversation window)
      const fallback = await sendPlainText(cleanPhone, code);
      if (fallback.success) return fallback;
      return {
        success: false,
        error:
          data?.error?.message ||
          "Could not send WhatsApp OTP. Make sure your template is approved.",
      };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (err) {
    console.error("[whatsapp-otp] Send failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

async function sendPlainText(
  cleanPhone: string,
  code: string
): Promise<SendOtpResult> {
  try {
    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "text",
        text: {
          body: `Your Zambia.net Marketplace verification code is: ${code}\n\nThis code expires in 10 minutes. Don't share it with anyone.`,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data?.error?.message };
    }
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}
