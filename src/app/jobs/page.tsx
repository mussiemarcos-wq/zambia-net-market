import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import JobsPageClient from "./JobsPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jobs - Zambia.net Marketplace",
  description:
    "Browse job listings in Zambia. Find full-time, part-time, freelance, and skilled trade opportunities.",
};

export default async function JobsPage() {
  const jobsCategory = await prisma.category.findUnique({
    where: { slug: "jobs" },
    include: {
      subcategories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!jobsCategory) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Jobs category not found.</p>
      </div>
    );
  }

  const listings = await prisma.listing.findMany({
    where: {
      categoryId: jobsCategory.id,
      status: "ACTIVE",
    },
    include: {
      subcategory: { select: { name: true, slug: true } },
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          isVerified: true,
          avatarUrl: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = listings.map((l) => ({
    id: l.id,
    title: l.title,
    description: l.description,
    price: l.price ? l.price.toString() : null,
    priceType: l.priceType,
    location: l.location,
    viewsCount: l.viewsCount,
    createdAt: l.createdAt.toISOString(),
    subcategory: l.subcategory
      ? { name: l.subcategory.name, slug: l.subcategory.slug }
      : null,
    user: {
      id: l.user.id,
      name: l.user.name,
      phone: l.user.phone,
      isVerified: l.user.isVerified,
      avatarUrl: l.user.avatarUrl,
    },
    images: l.images.map((img) => ({
      url: img.url,
      thumbnailUrl: img.thumbnailUrl,
    })),
  }));

  const subcategories = jobsCategory.subcategories.map((s) => ({
    name: s.name,
    slug: s.slug,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs Board</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse {serialized.length} job{serialized.length !== 1 ? "s" : ""}{" "}
            across Zambia
          </p>
        </div>
        <Link
          href="/listings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Post a Job
        </Link>
      </div>

      <JobsPageClient listings={serialized} subcategories={subcategories} />
    </div>
  );
}
