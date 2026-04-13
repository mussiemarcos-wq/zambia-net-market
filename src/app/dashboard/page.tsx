import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import DashboardClient from "./DashboardClient";
import RepostReminders from "@/components/RepostReminders";
import RecentlyViewed from "@/components/RecentlyViewed";
import ShareMarketplace from "@/components/ShareMarketplace";
import Link from "next/link";
import { Plus, BarChart3, Building2, BadgeCheck, CreditCard, Gift, Wrench, Briefcase, Home, Car, TrendingUp, Code, User } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard - Zambia.net Marketplace",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const listings = await prisma.listing.findMany({
    where: { userId: user.id },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === "ACTIVE").length,
    totalViews: listings.reduce((sum, l) => sum + l.viewsCount, 0),
    totalWhatsappClicks: listings.reduce((sum, l) => sum + l.whatsappClicks, 0),
  };

  const serialized = listings.map((l) => ({
    id: l.id,
    title: l.title,
    price: l.price ? l.price.toString() : null,
    priceType: l.priceType,
    status: l.status,
    viewsCount: l.viewsCount,
    whatsappClicks: l.whatsappClicks,
    createdAt: l.createdAt.toISOString(),
    images: l.images.map((img) => ({
      url: img.url,
      thumbnailUrl: img.thumbnailUrl,
    })),
    category: { name: l.category.name },
    isBoosted: l.isBoosted,
    isFeatured: l.isFeatured,
    boostExpires: l.boostExpires ? l.boostExpires.toISOString() : null,
    featureExpires: l.featureExpires ? l.featureExpires.toISOString() : null,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {user.name}. Manage your listings and track performance.
          </p>
        </div>
        <Link
          href="/listings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Listing
        </Link>
      </div>

      {/* Share the marketplace */}
      <ShareMarketplace />

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <Link
          href="/dashboard/analytics"
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Analytics</p>
            <p className="text-xs text-gray-500">Views & clicks</p>
          </div>
        </Link>
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-cyan-300 hover:bg-cyan-50 transition"
        >
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">My Profile</p>
            <p className="text-xs text-gray-500">Edit details</p>
          </div>
        </Link>
        <Link
          href="/dashboard/business"
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Business Profile</p>
            <p className="text-xs text-gray-500">Subscriptions</p>
          </div>
        </Link>
        <Link
          href="/dashboard/business#verification"
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <BadgeCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Get Verified</p>
            <p className="text-xs text-gray-500">K25 badge</p>
          </div>
        </Link>
        <Link
          href="/api/payments/history"
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition"
        >
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Payments</p>
            <p className="text-xs text-gray-500">History</p>
          </div>
        </Link>
        <Link
          href="/dashboard/referrals"
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition"
        >
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Gift className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Invite Friends</p>
            <p className="text-xs text-gray-500">Earn rewards</p>
          </div>
        </Link>
        <Link
          href="/dashboard/services"
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition"
        >
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Services Hub</p>
            <p className="text-xs text-gray-500">Leads & plans</p>
          </div>
        </Link>
        <Link
          href="/dashboard/jobs"
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition"
        >
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Jobs Hub</p>
            <p className="text-xs text-gray-500">Post & track</p>
          </div>
        </Link>
        <Link
          href="/dashboard/property"
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-rose-300 hover:bg-rose-50 transition"
        >
          <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Property Hub</p>
            <p className="text-xs text-gray-500">Agent tools</p>
          </div>
        </Link>
        <Link
          href="/dashboard/vehicles"
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition"
        >
          <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Vehicles Hub</p>
            <p className="text-xs text-gray-500">Dealer tools</p>
          </div>
        </Link>
        <Link
          href="/dashboard/insights"
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition"
        >
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Market Insights</p>
            <p className="text-xs text-gray-500">Trends & data</p>
          </div>
        </Link>
        <Link
          href="/dashboard/api"
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition"
        >
          <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
            <Code className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">API Access</p>
            <p className="text-xs text-gray-500">Developer tools</p>
          </div>
        </Link>
      </div>

      <RepostReminders />
      <RecentlyViewed />
      <DashboardClient listings={serialized} stats={stats} />
    </div>
  );
}
