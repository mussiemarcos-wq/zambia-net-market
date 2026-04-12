import { Metadata } from "next";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { BadgeCheck, MapPin, Search, Car, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find a Vehicle Dealer - Zambia.net Marketplace",
  description: "Browse verified vehicle dealers and auto professionals in Zambia.",
};

interface DealersPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function DealersPage({ searchParams }: DealersPageProps) {
  const { search } = await searchParams;

  // Find the vehicles category
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

  // Build the where clause
  const where: Record<string, unknown> = {
    businessProfile: { isNot: null },
    listings: {
      some: {
        categoryId: vehiclesCategory.id,
        status: "ACTIVE" as const,
      },
    },
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
      {
        businessProfile: {
          businessName: { contains: search, mode: "insensitive" },
        },
      },
    ];
  }

  const dealers = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      isVerified: true,
      location: true,
      businessProfile: {
        select: {
          businessName: true,
        },
      },
      _count: {
        select: {
          listings: {
            where: {
              categoryId: vehiclesCategory.id,
              status: "ACTIVE",
            },
          },
        },
      },
    },
    orderBy: [{ isVerified: "desc" }, { name: "asc" }],
    take: 50,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-900">Find a Vehicle Dealer</h1>
            <p className="text-gray-600 mt-2">
              Browse verified vehicle dealers and auto professionals across Zambia.
              Connect directly to find your perfect vehicle.
            </p>
          </div>

          {/* Search */}
          <form method="GET" className="mt-6 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={search || ""}
                placeholder="Search by name, business, or location..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Dealers Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {search && (
          <p className="text-sm text-gray-500 mb-4">
            {dealers.length} {dealers.length === 1 ? "dealer" : "dealers"} found for &quot;{search}&quot;
          </p>
        )}

        {dealers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {dealers.map((dealer) => {
              const initial = dealer.name.charAt(0).toUpperCase();
              return (
                <Link
                  key={dealer.id}
                  href={`/sellers/${dealer.id}`}
                  className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition"
                >
                  <div className="p-6 text-center">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto overflow-hidden">
                      {dealer.avatarUrl ? (
                        <img
                          src={dealer.avatarUrl}
                          alt={dealer.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-blue-600">
                          {initial}
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <div className="mt-3 flex items-center justify-center gap-1.5">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {dealer.name}
                      </h3>
                      {dealer.isVerified && (
                        <BadgeCheck className="w-4.5 h-4.5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>

                    {/* Business Name */}
                    {dealer.businessProfile?.businessName && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Car className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-sm text-gray-500 truncate">
                          {dealer.businessProfile.businessName}
                        </p>
                      </div>
                    )}

                    {/* Location */}
                    {dealer.location && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-sm text-gray-500">{dealer.location}</p>
                      </div>
                    )}

                    {/* Vehicle count */}
                    <p className="text-sm text-gray-600 mt-3 font-medium">
                      {dealer._count.listings} active {dealer._count.listings === 1 ? "vehicle" : "vehicles"}
                    </p>

                    {/* CTA */}
                    <div className="mt-4 flex items-center justify-center gap-1 text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
                      View Profile
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg font-medium">No dealers found</p>
            <p className="text-gray-400 mt-1 text-sm">
              {search
                ? "Try a different search term."
                : "No vehicle dealers have been registered yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
