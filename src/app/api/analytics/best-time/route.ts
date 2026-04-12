import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error, unauthorized } from "@/lib/api";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const listings = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      select: {
        createdAt: true,
        viewsCount: true,
        whatsappClicks: true,
      },
    });

    // Group by day of week and hour
    const slots: Record<
      string,
      { totalViews: number; totalClicks: number; count: number }
    > = {};

    for (const listing of listings) {
      const date = new Date(listing.createdAt);
      const day = date.getDay(); // 0-6
      const hour = date.getHours(); // 0-23
      const key = `${day}-${hour}`;

      if (!slots[key]) {
        slots[key] = { totalViews: 0, totalClicks: 0, count: 0 };
      }
      slots[key].totalViews += listing.viewsCount;
      slots[key].totalClicks += listing.whatsappClicks;
      slots[key].count += 1;
    }

    // Calculate averages and sort
    const slotArray = Object.entries(slots).map(([key, data]) => {
      const [dayStr, hourStr] = key.split("-");
      const day = parseInt(dayStr);
      const hour = parseInt(hourStr);
      const avgViews = Math.round(data.totalViews / data.count);
      const avgClicks = Math.round(data.totalClicks / data.count);
      const amPm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

      return {
        day: DAY_NAMES[day],
        hour,
        label: `${DAY_NAMES[day]} ${displayHour}${amPm}`,
        avgViews,
        avgClicks,
      };
    });

    // Sort by avgViews descending
    slotArray.sort((a, b) => b.avgViews - a.avgViews);

    const bestSlots = slotArray.slice(0, 5);
    const worstSlots = slotArray.slice(-3).reverse();

    return success({ bestSlots, worstSlots });
  } catch (e) {
    return error("Failed to fetch best time data");
  }
}
