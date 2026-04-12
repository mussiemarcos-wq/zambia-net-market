import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { unauthorized, error, success } from "@/lib/api";
import { setWebhook, getWebhookInfo } from "@/lib/telegram";

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return unauthorized("Admin access required");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return error("NEXT_PUBLIC_APP_URL is not configured");
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`;

  try {
    const result = await setWebhook(webhookUrl);

    if (!result.ok) {
      return error(`Telegram API error: ${result.description || "Unknown error"}`);
    }

    return success({
      message: "Webhook set successfully",
      webhookUrl,
      telegramResponse: result,
    });
  } catch (err) {
    console.error("Failed to set Telegram webhook:", err);
    return error("Failed to set webhook. Check your TELEGRAM_BOT_TOKEN.");
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return unauthorized("Admin access required");
  }

  try {
    const info = await getWebhookInfo();
    return success(info);
  } catch (err) {
    console.error("Failed to get webhook info:", err);
    return error("Failed to get webhook info. Check your TELEGRAM_BOT_TOKEN.");
  }
}
