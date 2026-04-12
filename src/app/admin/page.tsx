import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import AdminClient from "./AdminClient";
import {
  Users,
  Package,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Panel - Zambia.net Market",
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  const [totalUsers, totalListings, activeListings, pendingReports] =
    await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.report.count({ where: { status: "PENDING" } }),
    ]);

  const reports = await prisma.report.findMany({
    include: {
      reporter: { select: { name: true } },
      listing: {
        select: {
          id: true,
          title: true,
          user: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const recentListings = await prisma.listing.findMany({
    include: {
      user: { select: { id: true, name: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const recentReviews = await prisma.review.findMany({
    include: {
      reviewer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const serializedReports = reports.map((r) => ({
    id: r.id,
    reason: r.reason,
    description: r.description,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    reporter: r.reporter,
    listing: r.listing
      ? {
          id: r.listing.id,
          title: r.listing.title,
          user: r.listing.user,
        }
      : null,
  }));

  const serializedListings = recentListings.map((l) => ({
    id: l.id,
    title: l.title,
    status: l.status,
    createdAt: l.createdAt.toISOString(),
    user: l.user,
    category: l.category,
  }));

  const serializedReviews = recentReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    reviewer: r.reviewer,
    seller: r.seller,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage listings, users, and reports.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Users"
          value={totalUsers}
          icon={<Users className="w-5 h-5 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatsCard
          label="Total Listings"
          value={totalListings}
          icon={<Package className="w-5 h-5 text-purple-600" />}
          bgColor="bg-purple-50"
        />
        <StatsCard
          label="Active Listings"
          value={activeListings}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          bgColor="bg-green-50"
        />
        <StatsCard
          label="Pending Reports"
          value={pendingReports}
          icon={<AlertTriangle className="w-5 h-5 text-yellow-600" />}
          bgColor="bg-yellow-50"
          highlight={pendingReports > 0}
        />
      </div>

      <AdminClient
        reports={serializedReports}
        recentListings={serializedListings}
        recentReviews={serializedReviews}
      />
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon,
  bgColor,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-xl border p-4 ${
        highlight ? "border-yellow-300" : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
