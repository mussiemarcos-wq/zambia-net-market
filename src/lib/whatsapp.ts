const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:7333";

interface DetectedIntent {
  type: "WTB" | "WTS" | "SEARCH" | "HELP";
  query?: string;
  category?: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  property: ["house", "houses", "rent", "rental", "apartment", "flat", "plot", "land", "room"],
  vehicles: ["car", "cars", "vehicle", "truck", "motorcycle", "bike", "motorbike"],
  electronics: ["phone", "phones", "laptop", "laptops", "computer", "tv", "tablet", "iphone", "samsung"],
  jobs: ["job", "jobs", "work", "employment", "hiring", "vacancy"],
  furniture: ["furniture", "sofa", "chair", "table", "bed", "desk", "couch"],
  fashion: ["clothes", "clothing", "shoes", "dress", "shirt"],
  services: ["plumber", "plumbing", "electrician", "electrical", "cleaning", "transport"],
  "building-materials": ["cement", "timber", "steel", "bricks", "building"],
};

export function detectIntent(message: string): DetectedIntent {
  const lower = message.toLowerCase().trim();

  // Check for help
  if (lower === "help" || lower === "/help" || lower === "hi" || lower === "hello") {
    return { type: "HELP" };
  }

  // Check for WTB
  if (lower.startsWith("wtb") || lower.includes("want to buy") || lower.includes("looking for")) {
    const query = lower
      .replace(/^wtb\s*/i, "")
      .replace(/want to buy\s*/i, "")
      .replace(/looking for\s*/i, "")
      .trim();
    const category = detectCategory(query);
    return { type: "WTB", query: query || undefined, category };
  }

  // Check for WTS
  if (lower.startsWith("wts") || lower.includes("want to sell") || lower.includes("selling")) {
    return { type: "WTS" };
  }

  // Default to search
  const category = detectCategory(lower);
  return { type: "SEARCH", query: lower, category };
}

function detectCategory(text: string): string | undefined {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }
  return undefined;
}

interface ListingForWhatsApp {
  id: string;
  title: string;
  price?: number | string | null;
  location?: string | null;
}

export function formatListingForWhatsApp(listing: ListingForWhatsApp): string {
  const price = listing.price != null ? `K${Number(listing.price).toLocaleString()}` : "Contact for price";
  const location = listing.location || "Not specified";
  return `*${listing.title}*\nPrice: ${price}\nLocation: ${location}\nView: ${APP_URL}/listings/${listing.id}`;
}

export function buildSearchResponse(listings: ListingForWhatsApp[]): string {
  if (listings.length === 0) {
    return `No listings found. Try a different search or post what you need!\n\nBrowse all: ${APP_URL}`;
  }

  const header = `Found ${listings.length} listing${listings.length > 1 ? "s" : ""}:\n\n`;
  const items = listings
    .map((l, i) => `${i + 1}. ${formatListingForWhatsApp(l)}`)
    .join("\n\n");
  const footer = `\n\nSee more at: ${APP_URL}`;

  return header + items + footer;
}

export function buildHelpMessage(): string {
  return [
    `Welcome to Zambia.net Market Bot!\n`,
    `Here's how to use me:\n`,
    `*Search:* Just type what you're looking for`,
    `  Example: "iPhone 15"`,
    `\n*Want to Buy:* Type WTB + item`,
    `  Example: "WTB laptop"`,
    `\n*Want to Sell:* Type WTS`,
    `  I'll send you a link to post your ad`,
    `\n*Categories:* property, vehicles, electronics, jobs, furniture, fashion, services`,
    `\nBrowse all listings: ${APP_URL}`,
  ].join("\n");
}
