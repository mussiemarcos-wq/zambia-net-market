import { Metadata } from "next";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { BadgeCheck, MapPin, Search, Building2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find a Property Agent - Zambia.net Marketplace",
  description: "Browse verified property agents and real estate professionals in Zambia.",
};

interface AgentsPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function AgentsPage({ searchParams }: AgentsPageProps) {
  const { search } = await searchParams;

  // Find the property category
  const propertyCategory = await prisma.category.findFirst({
    where: { slug: "property" },
  });

  if (!propertyCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Property category not configured.</p>
      </div>
    );
  }

  // Build the where clause
  const where: Record<string, unknown> = {
    businessProfile: { isNot: null },
    listings: {
      some: {
        categoryId: propertyCategory.id,
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

  const agents = await prisma.user.findMany({
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
              categoryId: propertyCategory.id,
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
            <h1 className="text-3xl font-bold text-gray-900">Find a Property Agent</h1>
            <p className="text-gray-600 mt-2">
              Browse verified property agents and real estate professionals across Zambia.
              Connect directly to find your perfect property.
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

      {/* Agents Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {search && (
          <p className="text-sm text-gray-500 mb-4">
            {agents.length} {agents.length === 1 ? "agent" : "agents"} found for &quot;{search}&quot;
          </p>
        )}

        {agents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {agents.map((agent) => {
              const initial = agent.name.charAt(0).toUpperCase();
              return (
                <Link
                  key={agent.id}
                  href={`/sellers/${agent.id}`}
                  className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition"
                >
                  <div className="p-6 text-center">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto overflow-hidden">
                      {agent.avatarUrl ? (
                        <img
                          src={agent.avatarUrl}
                          alt={agent.name}
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
                        {agent.name}
                      </h3>
                      {agent.isVerified && (
                        <BadgeCheck className="w-4.5 h-4.5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>

                    {/* Business Name */}
                    {agent.businessProfile?.businessName && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-sm text-gray-500 truncate">
                          {agent.businessProfile.businessName}
                        </p>
                      </div>
                    )}

                    {/* Location */}
                    {agent.location && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-sm text-gray-500">{agent.location}</p>
                      </div>
                    )}

                    {/* Listing count */}
                    <p className="text-sm text-gray-600 mt-3 font-medium">
                      {agent._count.listings} active {agent._count.listings === 1 ? "listing" : "listings"}
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
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg font-medium">No agents found</p>
            <p className="text-gray-400 mt-1 text-sm">
              {search
                ? "Try a different search term."
                : "No property agents have been registered yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
