import { Metadata } from "next";
import { prisma } from "@/lib/db";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { Search, Car, Truck, Bike, Wrench, Cog, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vehicles - Zambia.net Marketplace",
  description: "Browse cars, trucks, motorcycles, and auto parts for sale in Zambia.",
};

const VEHICLE_SUBCATEGORIES = [
  { name: "Cars", slug: "vehicles-cars", icon: Car },
  { name: "Trucks", slug: "vehicles-trucks", icon: Truck },
  { name: "Motorcycles", slug: "vehicles-motorcycles", icon: Bike },
  { name: "Parts & Accessories", slug: "vehicles-parts", icon: Wrench },
  { name: "Equipment & Machinery", slug: "vehicles-equipment", icon: Cog },
];

interface VehiclesPageProps {
  searchParams: Promise<{ sub?: string; q?: string }>;
}

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const { sub, q } = await searchParams;

  const vehiclesCategory = await prisma.category.findFirst({
    where: { slug: "vehicles" },
  });

  if (!vehiclesCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Vehicles category not configured.</p>
      </div>
    );
  }

  const where: Record<string, unknown> = {
    categoryId: vehiclesCategory.id,
    status: "ACTIVE",
  };

  if (sub) {
    const subcategory = await prisma.category.findFirst({
      where: { slug: sub },
    });
    if (subcategory) {
      where.subcategoryId = subcategory.id;
    }
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const listings = await prisma.listing.findMany({
    where,
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      user: {
        select: {
          id: true,
          name: true,
          isVerified: true,
          avatarUrl: true,
        },
      },
      category: { select: { name: true } },
    },
    orderBy: [{ isBoosted: "desc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
    take: 40,
  });

  const serialized = listings.map((l) => ({
    id: l.id,
    title: l.title,
    price: l.price ? l.price.toString() : null,
    priceType: l.priceType,
    location: l.location,
    condition: l.condition,
    isFeatured: l.isFeatured,
    isBoosted: l.isBoosted,
    viewsCount: l.viewsCount,
    createdAt: l.createdAt.toISOString(),
    images: l.images.map((img) => ({
      url: img.url,
      thumbnailUrl: img.thumbnailUrl,
    })),
    user: l.user,
    category: l.category,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <h1 className="text-4xl font-bold mb-3">Find Your Perfect Vehicle</h1>
          <p className="text-gray-300 text-lg mb-8 max-w-xl">
            Browse thousands of cars, trucks, motorcycles, and parts from dealers and private sellers across Zambia.
          </p>

          {/* Search */}
          <form method="GET" className="max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={q || ""}
                placeholder="Search vehicles..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Subcategory Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/vehicles"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              !sub
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
            }`}
          >
            All Vehicles
          </Link>
          {VEHICLE_SUBCATEGORIES.map((subcat) => {
            const Icon = subcat.icon;
            return (
              <Link
                key={subcat.slug}
                href={`/vehicles?sub=${subcat.slug}`}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  sub === subcat.slug
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {subcat.name}
              </Link>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            href="/dealers"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition"
          >
            <Car className="w-4 h-4 text-blue-600" />
            Find a Dealer
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            List Your Vehicle
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Listings Grid */}
        {serialized.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {serialized.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg font-medium">No vehicles found</p>
            <p className="text-gray-400 mt-1 text-sm">
              {q ? "Try a different search term." : "No vehicle listings are available right now."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
