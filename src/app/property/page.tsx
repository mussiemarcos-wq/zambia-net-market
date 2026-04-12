import { Metadata } from "next";
import { prisma } from "@/lib/db";
import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { Home, Users, SlidersHorizontal } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Property - Zambia.net Marketplace",
  description: "Browse properties for sale, rent, and land listings across Zambia.",
};

interface PropertyPageProps {
  searchParams: Promise<{
    type?: string;
    minPrice?: string;
    maxPrice?: string;
    location?: string;
  }>;
}

export default async function PropertyPage({ searchParams }: PropertyPageProps) {
  const { type, minPrice, maxPrice, location } = await searchParams;

  // Find the property category and its subcategories
  const propertyCategory = await prisma.category.findFirst({
    where: { slug: "property" },
    include: {
      subcategories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!propertyCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Property category not configured.</p>
      </div>
    );
  }

  // Build the where clause for listings
  const where: Record<string, unknown> = {
    categoryId: propertyCategory.id,
    status: "ACTIVE" as const,
  };

  // Filter by subcategory (type)
  if (type) {
    const subcategory = propertyCategory.subcategories.find(
      (s) => s.slug === type || s.slug === `property-${type}`
    );
    if (subcategory) {
      where.subcategoryId = subcategory.id;
    }
  }

  // Price filters
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice);
    if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice);
  }

  // Location filter
  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  // Fetch featured properties
  const featuredListings = await prisma.listing.findMany({
    where: {
      ...where,
      isFeatured: true,
    },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        select: { url: true, thumbnailUrl: true },
      },
      subcategory: { select: { name: true } },
      user: {
        select: {
          id: true,
          name: true,
          isVerified: true,
          avatarUrl: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  // Fetch all property listings
  const listings = await prisma.listing.findMany({
    where: {
      ...where,
      id: { notIn: featuredListings.map((l) => l.id) },
    },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        select: { url: true, thumbnailUrl: true },
      },
      subcategory: { select: { name: true } },
      user: {
        select: {
          id: true,
          name: true,
          isVerified: true,
          avatarUrl: true,
          phone: true,
        },
      },
    },
    orderBy: [
      { isBoosted: "desc" },
      { createdAt: "desc" },
    ],
    take: 50,
  });

  const serialize = (listing: typeof listings[number]) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price ? Number(listing.price) : null,
    priceType: listing.priceType,
    location: listing.location,
    description: listing.description,
    isFeatured: listing.isFeatured,
    isBoosted: listing.isBoosted,
    createdAt: listing.createdAt.toISOString(),
    images: listing.images,
    subcategory: listing.subcategory,
    user: listing.user,
  });

  const serializedFeatured = featuredListings.map(serialize);
  const serializedListings = listings.map(serialize);

  // Property type filters
  const propertyTypes = [
    { label: "All", slug: "" },
    { label: "Rentals", slug: "property-rentals" },
    { label: "Sales", slug: "property-sales" },
    { label: "Land", slug: "property-land" },
    { label: "Commercial", slug: "property-commercial" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold">Find Your Perfect Property</h1>
            <p className="text-blue-200 mt-2 text-lg">
              Browse homes, apartments, land, and commercial properties across Zambia.
            </p>
          </div>

          {/* Quick Action Links */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/agents"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm text-white rounded-xl font-medium text-sm hover:bg-white/25 transition border border-white/20"
            >
              <Users className="w-4 h-4" />
              Find an Agent
            </Link>
            <Link
              href="/listings/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl font-medium text-sm hover:bg-blue-50 transition"
            >
              <Home className="w-4 h-4" />
              List Your Property
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Filters</h2>
              </div>

              {/* Property Type */}
              <div className="mb-5">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Property Type</h3>
                <div className="space-y-1">
                  {propertyTypes.map((pt) => {
                    const isActive = type === pt.slug || (!type && pt.slug === "");
                    const href = pt.slug
                      ? `/property?type=${pt.slug}${minPrice ? `&minPrice=${minPrice}` : ""}${maxPrice ? `&maxPrice=${maxPrice}` : ""}${location ? `&location=${location}` : ""}`
                      : `/property${minPrice ? `?minPrice=${minPrice}` : ""}${maxPrice ? `${minPrice ? "&" : "?"}maxPrice=${maxPrice}` : ""}${location ? `${minPrice || maxPrice ? "&" : "?"}location=${location}` : ""}`;
                    return (
                      <Link
                        key={pt.slug}
                        href={href}
                        className={`block px-3 py-2 rounded-lg text-sm transition ${
                          isActive
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {pt.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
                <form method="GET" className="space-y-2">
                  {type && <input type="hidden" name="type" value={type} />}
                  {location && <input type="hidden" name="location" value={location} />}
                  <input
                    type="number"
                    name="minPrice"
                    defaultValue={minPrice || ""}
                    placeholder="Min (K)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    defaultValue={maxPrice || ""}
                    placeholder="Max (K)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    Apply
                  </button>
                </form>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                <form method="GET">
                  {type && <input type="hidden" name="type" value={type} />}
                  {minPrice && <input type="hidden" name="minPrice" value={minPrice} />}
                  {maxPrice && <input type="hidden" name="maxPrice" value={maxPrice} />}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="location"
                      defaultValue={location || ""}
                      placeholder="e.g. Lusaka"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                    >
                      Go
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Featured Properties */}
            {serializedFeatured.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Properties</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {serializedFeatured.map((listing) => (
                    <PropertyCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </section>
            )}

            {/* All Properties */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {type ? `${propertyTypes.find((pt) => pt.slug === type)?.label || "Properties"}` : "All Properties"}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({serializedFeatured.length + serializedListings.length} listings)
                </span>
              </h2>

              {serializedListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {serializedListings.map((listing) => (
                    <PropertyCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : serializedFeatured.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg font-medium">No properties found</p>
                  <p className="text-gray-400 mt-1 text-sm">
                    Try adjusting your filters or check back later.
                  </p>
                </div>
              ) : null}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
