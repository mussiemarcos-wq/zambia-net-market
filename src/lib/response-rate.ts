import { prisma } from "@/lib/db";

interface ResponseRateResult {
  rate: "fast" | "moderate" | "slow" | "unknown";
  avgHours: number | null;
  label: string;
}

export async function calculateResponseRate(
  userId: string
): Promise<ResponseRateResult> {
  const listings = await prisma.listing.findMany({
    where: { userId },
    select: {
      viewsCount: true,
      whatsappClicks: true,
    },
  });

  if (listings.length === 0) {
    return {
      rate: "unknown",
      avgHours: null,
      label: "",
    };
  }

  const totalViews = listings.reduce((sum, l) => sum + l.viewsCount, 0);
  const totalClicks = listings.reduce((sum, l) => sum + l.whatsappClicks, 0);

  if (totalViews === 0) {
    return {
      rate: "unknown",
      avgHours: null,
      label: "",
    };
  }

  const ratio = totalClicks / totalViews;

  if (ratio > 0.15) {
    return {
      rate: "fast",
      avgHours: 1,
      label: "Usually responds quickly",
    };
  }

  if (ratio >= 0.05) {
    return {
      rate: "moderate",
      avgHours: 12,
      label: "Responds within a day",
    };
  }

  return {
    rate: "slow",
    avgHours: 48,
    label: "May take time to respond",
  };
}
