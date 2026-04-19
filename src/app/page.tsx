import Link from "next/link";
import {
  Search,
  MessageCircle,
  Handshake,
  PenSquare,
  ArrowRight,
  ShieldCheck,
  Zap,
  Heart,
  TrendingUp,
  Users,
  BadgeCheck,
  MapPin,
  Smartphone,
  Building2,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/db";
import CategoryGrid from "@/components/CategoryGrid";
import ListingCard from "@/components/ListingCard";
import RecommendedListings from "@/components/RecommendedListings";
import BannerAd from "@/components/BannerAd";
import ReferralCapture from "@/components/ReferralCapture";

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

async function getStats() {
  const [totalListings, totalUsers, verifiedSellers, categoryCount] = await Promise.all([
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.user.count({ where: { isVerified: true } }),
    prisma.category.count({ where: { isActive: true } }),
  ]);
  return { totalListings, totalUsers, verifiedSellers, categoryCount };
}

async function getFeaturedSellers() {
  // Top sellers by listing count with verified badge preference
  const sellers = await prisma.user.findMany({
    where: {
      listings: { some: { status: "ACTIVE" } },
    },
    orderBy: [
      { isVerified: "desc" },
      { referralCount: "desc" },
    ],
    take: 6,
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      isVerified: true,
      location: true,
      _count: { select: { listings: { where: { status: "ACTIVE" } } } },
    },
  });
  return sellers;
}

const STEPS = [
  {
    icon: PenSquare,
    title: "Post Your Ad",
    description:
      "Create a free listing in seconds with photos, price, and details.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: MessageCircle,
    title: "Get Contacted",
    description:
      "Interested buyers reach you directly on WhatsApp or Telegram. No middlemen.",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Handshake,
    title: "Make the Deal",
    description:
      "Negotiate, meet up, and close the deal on your own terms.",
    color: "from-purple-500 to-purple-600",
  },
];

const TRUST_FEATURES = [
  {
    icon: ShieldCheck,
    title: "Safe & Trusted",
    description: "Verified sellers, listing quality scores, and community reviews keep your transactions safe.",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: Zap,
    title: "Instant Contact",
    description: "Reach sellers directly via WhatsApp or Telegram — no waiting, no hassles.",
    color: "text-yellow-600 bg-yellow-50",
  },
  {
    icon: MapPin,
    title: "Local to You",
    description: "Find items and deals right in your neighbourhood across Zambia.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Sparkles,
    title: "Pay Only for Growth",
    description: "Post 3 listings free. Upgrade with boosts, featured placement or business plans when you're ready to scale.",
    color: "text-purple-600 bg-purple-50",
  },
];

function formatStat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
  if (n >= 100) return `${Math.floor(n / 10) * 10}+`;
  return String(n);
}

export default async function HomePage() {
  const [categories, listings, stats, featuredSellers] = await Promise.all([
    getCategories(),
    getRecentListings(),
    getStats(),
    getFeaturedSellers(),
  ]);

  return (
    <>
      {/* Capture referral code from URL */}
      <ReferralCapture />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-400/10 via-transparent to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-blue-100">Zambia&apos;s fastest-growing marketplace</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Buy, Sell, and Connect <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Across Zambia
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Post up to 3 ads free, find great deals, and connect directly with
            buyers and sellers in your area. No middlemen, no commissions —
            just trusted local commerce.
          </p>

          {/* Search Bar */}
          <form action="/search" method="get" className="mt-10 max-w-2xl mx-auto">
            <div className="flex rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/30 ring-1 ring-white/10">
              <div className="relative flex-1 bg-white">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="What are you looking for?"
                  className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-8 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 font-bold transition"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-blue-200">
            <span className="font-medium">Popular:</span>
            {[
              { label: "Phones", href: "/search?subcategory=electronics-phones" },
              { label: "Cars", href: "/search?subcategory=vehicles-cars" },
              { label: "Rentals", href: "/search?subcategory=property-rentals" },
              { label: "Jobs", href: "/search?category=jobs" },
              { label: "Furniture", href: "/search?category=furniture" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Stats ribbon */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">
                {formatStat(stats.totalListings)}
              </div>
              <div className="text-xs md:text-sm text-blue-200 mt-1">Active Listings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">
                {formatStat(stats.totalUsers)}
              </div>
              <div className="text-xs md:text-sm text-blue-200 mt-1">Happy Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">
                {stats.categoryCount}
              </div>
              <div className="text-xs md:text-sm text-blue-200 mt-1">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">
                {formatStat(stats.verifiedSellers)}
              </div>
              <div className="text-xs md:text-sm text-blue-200 mt-1">Verified Sellers</div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <svg
          className="block w-full h-12 md:h-16"
          viewBox="0 0 1440 64"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 64L60 53.3C120 43 240 21 360 16C480 11 600 21 720 26.7C840 32 960 32 1080 26.7C1200 21 1320 11 1380 5.3L1440 0V64H1380C1320 64 1200 64 1080 64C960 64 840 64 720 64C600 64 480 64 360 64C240 64 120 64 60 64H0Z"
            fill="rgb(249 250 251)"
            className="dark:fill-gray-900"
          />
        </svg>
      </section>

      {/* Banner Ad */}
      <BannerAd placement="homepage" />

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Browse Categories
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Find what you need across {stats.categoryCount} categories
          </p>
        </div>
        <CategoryGrid categories={categories} />
      </section>

      {/* Why Zambia.net Marketplace */}
      <section className="bg-white dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-semibold rounded-full">
              Why Zambia.net Marketplace
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Built for Zambia, by Zambians
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              A trusted local marketplace with the features buyers and sellers actually need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition group"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.color} group-hover:scale-110 transition`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="mt-4 font-bold text-gray-900 dark:text-gray-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Fresh Listings
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              New items posted by your community
            </p>
          </div>
          <Link
            href="/search?sort=newest"
            className="hidden sm:inline-flex text-blue-600 hover:text-blue-700 text-sm font-medium items-center gap-1"
          >
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {listings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PenSquare className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-lg text-gray-900 dark:text-gray-100 font-semibold">
              No listings yet
            </p>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Be the first to post!
            </p>
            <Link
              href="/listings/new"
              className="mt-6 inline-block bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
            >
              Post a Listing
            </Link>
          </div>
        )}
      </section>

      {/* Recommended / Trending */}
      <RecommendedListings excludeIds={listings.map((l) => l.id)} />

      {/* Featured Sellers */}
      {featuredSellers.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900 border-t border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-sm font-semibold rounded-full">
                Top Sellers
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                Meet our Community
              </h2>
              <p className="mt-3 text-gray-500 dark:text-gray-400">
                Trusted sellers with quality listings
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredSellers.map((seller) => (
                <Link
                  key={seller.id}
                  href={`/sellers/${seller.id}`}
                  className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-center hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition"
                >
                  <div className="relative w-16 h-16 mx-auto">
                    {seller.avatarUrl ? (
                      <img
                        src={seller.avatarUrl}
                        alt={seller.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                        {seller.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {seller.isVerified && (
                      <BadgeCheck className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 bg-white dark:bg-gray-800 rounded-full" />
                    )}
                  </div>
                  <h3 className="mt-3 font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                    {seller.name.split(" ")[0]}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {seller._count.listings} listings
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 text-sm font-semibold rounded-full">
              Get Started
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Sell in Three Simple Steps
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              It takes less than a minute to list your first item
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-green-200 to-purple-200 dark:from-blue-800 dark:via-green-800 dark:to-purple-800" />

            {STEPS.map((step, i) => (
              <div key={step.title} className="text-center relative">
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg relative z-10`}
                >
                  <step.icon className="w-9 h-9 text-white" />
                </div>
                <div className="inline-block text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full mb-3">
                  STEP {i + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 rounded-3xl p-10 md:p-16 text-white shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-4">
                <TrendingUp className="w-4 h-4" />
                <span>Ready to grow?</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Turn your items into cash today
              </h2>
              <p className="mt-4 text-blue-100 text-lg">
                Post your ad in under a minute. Reach thousands of local buyers.
                Close deals on WhatsApp.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/listings/new"
                  className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-3.5 rounded-xl transition"
                >
                  Post Your Ad <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/dashboard/business"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition"
                >
                  <Building2 className="w-5 h-5" /> For Business
                </Link>
              </div>
            </div>

            <div className="hidden md:grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                <Users className="w-8 h-8 text-yellow-300 mb-3" />
                <p className="text-sm text-blue-100">Active Community</p>
                <p className="text-2xl font-bold">{formatStat(stats.totalUsers)} Users</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 translate-y-6">
                <Smartphone className="w-8 h-8 text-yellow-300 mb-3" />
                <p className="text-sm text-blue-100">Direct Contact</p>
                <p className="text-2xl font-bold">WhatsApp Ready</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                <Heart className="w-8 h-8 text-yellow-300 mb-3" />
                <p className="text-sm text-blue-100">Pay Only for Growth</p>
                <p className="text-2xl font-bold">3 Free Ads</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 translate-y-6">
                <ShieldCheck className="w-8 h-8 text-yellow-300 mb-3" />
                <p className="text-sm text-blue-100">Trusted Platform</p>
                <p className="text-2xl font-bold">Verified Sellers</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
