import Link from "next/link";
import { Search, MessageCircle, Handshake, PenSquare, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { APP_NAME } from "@/lib/constants";
import CategoryGrid from "@/components/CategoryGrid";
import ListingCard from "@/components/ListingCard";
import RecommendedListings from "@/components/RecommendedListings";
import BannerAd from "@/components/BannerAd";

export const dynamic = "force-dynamic";

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { listings: { where: { status: "ACTIVE" } } } },
    },
  });
  return categories;
}

async function getRecentListings() {
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    orderBy: [
      { isBoosted: "desc" },
      { isFeatured: "desc" },
      { createdAt: "desc" },
    ],
    take: 12,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      user: {
        select: { id: true, name: true, isVerified: true, avatarUrl: true },
      },
      category: { select: { name: true } },
    },
  });

  return listings.map((l) => ({
    id: l.id,
    title: l.title,
    price: l.price ? Number(l.price) : null,
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
}

const STEPS = [
  {
    icon: PenSquare,
    title: "Post Your Ad",
    description:
      "Create a free listing in seconds with photos, price, and details.",
  },
  {
    icon: MessageCircle,
    title: "Get Contacted via WhatsApp",
    description:
      "Interested buyers reach you directly on WhatsApp. No middlemen.",
  },
  {
    icon: Handshake,
    title: "Make the Deal",
    description:
      "Negotiate, meet up, and close the deal on your own terms.",
  },
];

export default async function HomePage() {
  const [categories, listings] = await Promise.all([
    getCategories(),
    getRecentListings(),
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Your Local Marketplace
          </h1>
          <p className="mt-4 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            Post ads for free, find great deals, and connect with buyers and
            sellers in your area.
          </p>

          {/* Search Bar */}
          <form action="/search" method="get" className="mt-8 max-w-xl mx-auto">
            <div className="flex rounded-xl overflow-hidden shadow-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search for anything..."
                  className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold transition"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-blue-200">
            <span>Popular:</span>
            {["Phones", "Cars", "Rentals", "Jobs", "Furniture"].map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="underline underline-offset-2 hover:text-white transition"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Banner Ad */}
      <BannerAd placement="homepage" />

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Browse Categories</h2>
          <Link
            href="/search"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <CategoryGrid categories={categories} />
      </section>

      {/* Recent Listings */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Listings</h2>
          <Link
            href="/search?sort=newest"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            See more <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {listings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No listings yet. Be the first to post!</p>
            <Link
              href="/post"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Post a Listing
            </Link>
          </div>
        )}
      </section>

      {/* Recommended / Trending */}
      <RecommendedListings />

      {/* How It Works */}
      <section className="bg-white border-t border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-sm font-semibold text-blue-600 mb-1">
                  Step {i + 1}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to sell something?
          </h2>
          <p className="mt-2 text-blue-100 max-w-lg mx-auto">
            List your item in under a minute and reach thousands of buyers in
            your area. Boost your ad for even more visibility.
          </p>
          <Link
            href="/listings/new"
            className="mt-6 inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-3 rounded-xl transition"
          >
            Post Your Ad <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
