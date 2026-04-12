interface QualityInput {
  title: string;
  description?: string | null;
  price?: unknown;
  priceType: string;
  location?: string | null;
  condition?: string | null;
  categoryId?: string | null;
  subcategoryId?: string | null;
  images: { id: string }[] | { url: string }[];
}

interface QualityResult {
  score: number;
  grade: "A" | "B" | "C" | "D";
  tips: string[];
}

export function calculateQualityScore(listing: QualityInput): QualityResult {
  let score = 0;
  const tips: string[] = [];

  // Has at least 1 photo: +25 (0 photos = -25)
  if (listing.images && listing.images.length >= 1) {
    score += 25;
  } else {
    score -= 25;
    tips.push("Add photos to get 3x more views");
  }

  // Has 3+ photos: +10
  if (listing.images && listing.images.length >= 3) {
    score += 10;
  } else if (listing.images && listing.images.length >= 1) {
    tips.push("Add more photos (3+) to increase buyer confidence");
  }

  // Description length > 50 chars: +15
  const descLen = listing.description?.length || 0;
  if (descLen > 50) {
    score += 15;
  } else {
    tips.push("Write a longer description to build buyer confidence");
  }

  // Description length > 150 chars: +10
  if (descLen > 150) {
    score += 10;
  } else if (descLen > 50) {
    tips.push(
      "Expand your description to 150+ characters for better engagement"
    );
  }

  // Price is set (not CONTACT): +10
  if (listing.priceType !== "CONTACT") {
    score += 10;
  } else {
    tips.push("Set a specific price — listings with prices get more interest");
  }

  // Location is set: +10
  if (listing.location) {
    score += 10;
  } else {
    tips.push("Add your location to attract nearby buyers");
  }

  // Condition is specified: +5
  if (listing.condition) {
    score += 5;
  } else {
    tips.push("Specify the item condition (new, used, etc.)");
  }

  // Title length 15-80 chars: +10
  const titleLen = listing.title?.length || 0;
  if (titleLen >= 15 && titleLen <= 80) {
    score += 10;
  } else if (titleLen < 15) {
    tips.push("Use a more descriptive title (15+ characters)");
  } else {
    tips.push("Shorten your title — keep it under 80 characters");
  }

  // Has category AND subcategory: +5
  if (listing.categoryId && listing.subcategoryId) {
    score += 5;
  } else if (listing.categoryId && !listing.subcategoryId) {
    tips.push("Select a subcategory to help buyers find your listing");
  }

  // Clamp score to 0-100
  score = Math.min(100, Math.max(0, score));

  // Determine grade
  let grade: "A" | "B" | "C" | "D";
  if (score >= 80) {
    grade = "A";
  } else if (score >= 60) {
    grade = "B";
  } else if (score >= 40) {
    grade = "C";
  } else {
    grade = "D";
  }

  return { score, grade, tips };
}
