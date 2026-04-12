import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, unauthorized, error } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    // Find the "jobs" category
    const jobsCategory = await prisma.category.findUnique({
      where: { slug: "jobs" },
    });

    if (!jobsCategory) {
      return error("Jobs category not found", 404);
    }

    // Get all listings by the current user in the jobs category
    const listings = await prisma.listing.findMany({
      where: {
        userId: user.id,
        categoryId: jobsCategory.id,
      },
      include: {
        subcategory: { select: { name: true, slug: true } },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
      orderBy: { whatsappClicks: "desc" },
    });

    const serialized = listings.map((l) => ({
      id: l.id,
      title: l.title,
      status: l.status,
      viewsCount: l.viewsCount,
      applicationCount: l.whatsappClicks,
      createdAt: l.createdAt.toISOString(),
      expiresAt: l.expiresAt ? l.expiresAt.toISOString() : null,
      subcategory: l.subcategory ? l.subcategory.name : null,
      price: l.price ? l.price.toString() : null,
      location: l.location,
      image: l.images[0]?.thumbnailUrl || l.images[0]?.url || null,
    }));

    const totalJobs = listings.length;
    const activeJobs = listings.filter((l) => l.status === "ACTIVE").length;
    const totalViews = listings.reduce((sum, l) => sum + l.viewsCount, 0);
    const totalApplications = listings.reduce((sum, l) => sum + l.whatsappClicks, 0);
    const avgApplicationsPerJob = totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0;

    return success({
      listings: serialized,
      summary: {
        totalJobs,
        activeJobs,
        totalViews,
        totalApplications,
        avgApplicationsPerJob,
      },
    });
  } catch (err) {
    console.error("Failed to fetch job applications:", err);
    return error("Failed to fetch job data", 500);
  }
}
