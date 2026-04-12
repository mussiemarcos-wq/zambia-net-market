import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api";
import {
  detectIntent,
  buildSearchResponse,
  buildHelpMessage,
} from "@/lib/whatsapp";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:7333";
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "";

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge || "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extract message text from WhatsApp webhook payload
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;

    if (!messages || messages.length === 0) {
      // Could be a status update, acknowledge
      return success({ status: "ok" });
    }

    const message = messages[0];
    const messageText = message?.text?.body || "";

    if (!messageText) {
      return success({ status: "ok" });
    }

    const intent = detectIntent(messageText);
    let responseText = "";

    switch (intent.type) {
      case "WTB":
      case "SEARCH": {
        const where: Record<string, unknown> = { status: "ACTIVE" };

        if (intent.query) {
          where.title = { contains: intent.query, mode: "insensitive" };
        }

        if (intent.category) {
          where.category = {
            slug: { startsWith: intent.category },
          };
        }

        const listings = await prisma.listing.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            price: true,
            location: true,
          },
        });

        const formatted = listings.map((l) => ({
          id: l.id,
          title: l.title,
          price: l.price ? Number(l.price) : null,
          location: l.location,
        }));

        responseText = buildSearchResponse(formatted);
        break;
      }

      case "WTS": {
        responseText = `Ready to sell? Post your ad here:\n${APP_URL}/listings/new\n\nIt's quick, easy, and free!`;
        break;
      }

      case "HELP":
      default: {
        responseText = buildHelpMessage();
        break;
      }
    }

    return success({ reply: responseText });
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    // Always return 200 to WhatsApp
    return success({ status: "error" });
  }
}
