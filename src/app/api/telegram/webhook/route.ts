import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  sendMessage,
  answerCallbackQuery,
  sendPhoto,
  buildInlineKeyboard,
  formatListingsResponse,
  formatListingMessage,
  escapeMarkdown,
} from "@/lib/telegram";

// Always return 200 to Telegram so it doesn't retry
function ok() {
  return NextResponse.json({ ok: true });
}

// ---------------------------------------------------------------------------
// POST /api/telegram/webhook
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // Handle callback queries (inline keyboard button presses)
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
      return ok();
    }

    // Handle text messages
    const message = update.message;
    if (!message?.text) return ok();

    const chatId = message.chat.id;
    const text = message.text.trim();

    if (text === "/start") {
      await handleStart(chatId);
    } else if (text.startsWith("/search")) {
      const query = text.replace("/search", "").trim();
      await handleSearch(chatId, query);
    } else if (text === "/categories") {
      await handleCategories(chatId);
    } else if (text === "/latest") {
      await handleLatest(chatId);
    } else if (text === "/help") {
      await handleHelp(chatId);
    } else {
      // Treat any non-command text as a search
      await handleSearch(chatId, text);
    }
  } catch (err) {
    console.error("Telegram webhook error:", err);
  }

  return ok();
}

// ---------------------------------------------------------------------------
// Command handlers
// ---------------------------------------------------------------------------

async function handleStart(chatId: number) {
  const welcomeText = `👋 *Welcome to Zambia\\.net Marketplace Bot\\!*

I can help you browse and search listings right here in Telegram\\.

Use the buttons below or type a command to get started:`;

  const keyboard = buildInlineKeyboard([
    [
      { text: "🔍 Search Listings", callback_data: "action:search" },
      { text: "📂 Categories", callback_data: "action:categories" },
    ],
    [
      { text: "🆕 Latest Listings", callback_data: "action:latest" },
      { text: "❓ Help", callback_data: "action:help" },
    ],
  ]);

  await sendMessage(chatId, welcomeText, { reply_markup: keyboard });
}

async function handleSearch(chatId: number, query: string) {
  if (!query) {
    await sendMessage(
      chatId,
      "Please provide a search term\\. Example:\n`/search iPhone`"
    );
    return;
  }

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      title: { contains: query, mode: "insensitive" },
    },
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
    orderBy: [{ isBoosted: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
    take: 5,
  });

  const response = formatListingsResponse(listings, query);

  // If the first listing has an image, send it as a photo
  if (listings.length > 0 && listings[0].images?.[0]?.url) {
    await sendPhoto(chatId, listings[0].images[0].url, response);
  } else {
    await sendMessage(chatId, response);
  }
}

async function handleCategories(chatId: number) {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  if (categories.length === 0) {
    await sendMessage(chatId, "No categories available right now\\.");
    return;
  }

  // Build rows of 2 buttons each
  const rows: { text: string; callback_data: string }[][] = [];
  for (let i = 0; i < categories.length; i += 2) {
    const row = [
      {
        text: `${categories[i].icon || "📦"} ${categories[i].name}`,
        callback_data: `cat:${categories[i].slug}`,
      },
    ];
    if (categories[i + 1]) {
      row.push({
        text: `${categories[i + 1].icon || "📦"} ${categories[i + 1].name}`,
        callback_data: `cat:${categories[i + 1].slug}`,
      });
    }
    rows.push(row);
  }

  await sendMessage(chatId, "📂 *Browse by category:*", {
    reply_markup: buildInlineKeyboard(rows),
  });
}

async function handleLatest(chatId: number) {
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const response = listings.length
    ? `🆕 *Latest Listings:*\n\n${formatListingsResponse(listings)}`
    : "No active listings right now\\.";

  await sendMessage(chatId, response);
}

async function handleHelp(chatId: number) {
  const helpText = `*Zambia\\.net Marketplace Bot* \\- Commands:

/start \\- Show welcome message and menu
/search \\<query\\> \\- Search listings by keyword
/categories \\- Browse categories
/latest \\- View latest listings
/help \\- Show this help message

You can also just type any text and I'll search for matching listings\\!`;

  await sendMessage(chatId, helpText);
}

async function handleCategoryListings(chatId: number, categorySlug: string) {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    await sendMessage(chatId, "Category not found\\.");
    return;
  }

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      categoryId: category.id,
    },
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
    orderBy: [{ isBoosted: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
    take: 5,
  });

  const header = `📂 *${escapeMarkdown(category.name)}*\n\n`;

  if (listings.length === 0) {
    await sendMessage(chatId, `${header}No listings in this category yet\\.`);
    return;
  }

  const response = `${header}${formatListingsResponse(listings)}`;
  await sendMessage(chatId, response);
}

// ---------------------------------------------------------------------------
// Callback query handler
// ---------------------------------------------------------------------------

async function handleCallbackQuery(callbackQuery: {
  id: string;
  message?: { chat: { id: number } };
  data?: string;
}) {
  await answerCallbackQuery(callbackQuery.id);

  const chatId = callbackQuery.message?.chat?.id;
  const data = callbackQuery.data;
  if (!chatId || !data) return;

  if (data.startsWith("cat:")) {
    const slug = data.replace("cat:", "");
    await handleCategoryListings(chatId, slug);
  } else if (data === "action:search") {
    await sendMessage(
      chatId,
      "🔍 Type your search query or use:\n`/search iPhone`"
    );
  } else if (data === "action:categories") {
    await handleCategories(chatId);
  } else if (data === "action:latest") {
    await handleLatest(chatId);
  } else if (data === "action:help") {
    await handleHelp(chatId);
  }
}
