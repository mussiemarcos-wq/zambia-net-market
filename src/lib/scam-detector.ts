import { PrismaClient, Prisma } from "@prisma/client";

interface ScamInput {
  title: string;
  description?: string | null;
  price?: number | Prisma.Decimal | null;
  categoryId: string;
}

interface ScamResult {
  isHighRisk: boolean;
  warnings: string[];
  score: number;
}

const SUSPICIOUS_PHRASES = [
  "send money first",
  "pay before delivery",
  "western union",
  "wire transfer",
  "too good to be true",
  "urgent sale",
  "act now",
  "limited time",
  "pay via gift card",
  "money order",
  "won a prize",
  "advance payment",
  "deposit required before viewing",
];

const PHONE_EMAIL_REGEX =
  /(\+?\d[\d\s\-]{7,}\d)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

export async function detectScamSignals(
  listing: ScamInput,
  prisma: PrismaClient
): Promise<ScamResult> {
  let score = 0;
  const warnings: string[] = [];

  const title = listing.title || "";
  const description = listing.description || "";
  const combinedText = `${title} ${description}`.toLowerCase();

  // 1. Check for suspicious phrases (+15 each, max contribution capped at 45)
  let phraseHits = 0;
  for (const phrase of SUSPICIOUS_PHRASES) {
    if (combinedText.includes(phrase)) {
      phraseHits++;
      warnings.push(`Contains suspicious phrase: "${phrase}"`);
    }
  }
  score += Math.min(phraseHits * 15, 45);

  // 2. ALL CAPS title (more than 50% uppercase)
  if (title.length > 0) {
    const upperCount = (title.match(/[A-Z]/g) || []).length;
    const letterCount = (title.match(/[a-zA-Z]/g) || []).length;
    if (letterCount > 0 && upperCount / letterCount > 0.5) {
      score += 10;
      warnings.push("Title is mostly uppercase, which can appear spammy");
    }
  }

  // 3. Excessive exclamation marks (more than 3)
  const exclamationCount = (combinedText.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    score += 10;
    warnings.push("Excessive use of exclamation marks");
  }

  // 4. Phone/email in description (bypassing platform contact)
  if (description && PHONE_EMAIL_REGEX.test(description)) {
    score += 15;
    warnings.push(
      "Contains phone number or email in description — may be trying to bypass the platform contact system"
    );
  }

  // 5. Very short description with high price
  if (
    description &&
    description.length < 10 &&
    listing.price &&
    Number(listing.price) > 1000
  ) {
    score += 15;
    warnings.push(
      "Very short description for a high-priced item — provide more details to build trust"
    );
  }

  // 6. Suspiciously low price compared to category average
  if (listing.price && Number(listing.price) > 0) {
    try {
      const categoryAvg = await prisma.listing.aggregate({
        where: {
          categoryId: listing.categoryId,
          status: "ACTIVE",
          price: { not: null, gt: 0 },
        },
        _avg: { price: true },
        _count: { price: true },
      });

      if (
        categoryAvg._avg.price &&
        categoryAvg._count.price >= 3 &&
        Number(listing.price) < Number(categoryAvg._avg.price) * 0.1
      ) {
        score += 20;
        warnings.push(
          "Price is suspiciously low compared to similar listings in this category"
        );
      }
    } catch {
      // If the query fails, skip this check
    }
  }

  // Clamp score to 0-100
  score = Math.min(100, Math.max(0, score));

  return {
    isHighRisk: score > 60,
    warnings,
    score,
  };
}
