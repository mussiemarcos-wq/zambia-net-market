import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const listings = await prisma.listing.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      title: true,
      viewsCount: true,
      whatsappClicks: true,
      _count: {
        select: { favourites: true },
      },
    },
    orderBy: { viewsCount: "desc" },
  });

  const breakdown = listings.map((l) => ({
    id: l.id,
    title: l.title,
    viewsCount: l.viewsCount,
    whatsappClicks: l.whatsappClicks,
    favouriteCount: l._count.favourites,
  }));

  const totalViews = breakdown.reduce((sum, l) => sum + l.viewsCount, 0);
  const totalWhatsappClicks = breakdown.reduce((sum, l) => sum + l.whatsappClicks, 0);
  const totalFavourites = breakdown.reduce((sum, l) => sum + l.favouriteCount, 0);

  return success({
    totalViews,
    totalWhatsappClicks,
    totalFavourites,
    listings: breakdown,
  });
}
