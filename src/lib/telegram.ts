import { formatPrice } from "./utils";

const TELEGRAM_API = "https://api.telegram.org/bot";

function getToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return token;
}

function apiUrl(method: string): string {
  return `${TELEGRAM_API}${getToken()}/${method}`;
}

// ---------------------------------------------------------------------------
// Core API helpers
// ---------------------------------------------------------------------------

export async function sendMessage(
  chatId: number | string,
  text: string,
  options?: {
    parse_mode?: "Markdown" | "HTML";
    reply_markup?: Record<string, unknown>;
  }
) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: options?.parse_mode ?? "Markdown",
  };
  if (options?.reply_markup) {
    body.reply_markup = options.reply_markup;
  }
  const res = await fetch(apiUrl("sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function sendPhoto(
  chatId: number | string,
  photoUrl: string,
  caption: string
) {
  const res = await fetch(apiUrl("sendPhoto"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: "Markdown",
    }),
  });
  return res.json();
}

export async function answerCallbackQuery(callbackQueryId: string) {
  const res = await fetch(apiUrl("answerCallbackQuery"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });
  return res.json();
}

export async function setWebhook(url: string) {
  const res = await fetch(apiUrl("setWebhook"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return res.json();
}

export async function getWebhookInfo() {
  const res = await fetch(apiUrl("getWebhookInfo"));
  return res.json();
}

// ---------------------------------------------------------------------------
// Keyboard helpers
// ---------------------------------------------------------------------------

export function buildInlineKeyboard(
  buttons: { text: string; callback_data?: string; url?: string }[][]
) {
  return {
    inline_keyboard: buttons,
  };
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

interface ListingForTelegram {
  id: string;
  title: string;
  price: unknown;
  priceType: string;
  location: string | null;
  viewsCount: number;
  images?: { url: string }[];
}

export function formatListingMessage(listing: ListingForTelegram): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const price =
    listing.priceType === "FREE"
      ? "Free"
      : listing.priceType === "CONTACT"
        ? "Contact for price"
        : formatPrice(listing.price as number);
  const location = listing.location ? `\n📍 ${listing.location}` : "";
  const link = `${appUrl}/listings/${listing.id}`;

  return `*${escapeMarkdown(listing.title)}*\n💰 ${price}${location}\n👁 ${listing.viewsCount} views\n🔗 [View listing](${link})`;
}

export function formatListingsResponse(
  listings: ListingForTelegram[],
  query?: string
): string {
  if (listings.length === 0) {
    return query
      ? `No listings found for "${escapeMarkdown(query)}". Try a different search term.`
      : "No listings found.";
  }

  const header = query
    ? `🔍 Results for "*${escapeMarkdown(query)}*":\n\n`
    : "";

  const items = listings
    .map((listing, i) => `${i + 1}. ${formatListingMessage(listing)}`)
    .join("\n\n");

  return `${header}${items}`;
}

export function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
}
