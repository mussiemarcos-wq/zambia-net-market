"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  MessageCircle,
  Pencil,
  Trash2,
  CheckCircle,
  Package,
  Filter,
  Zap,
  Star,
  BarChart3,
} from "lucide-react";
import { formatPrice, timeAgo, cn } from "@/lib/utils";
import BoostModal from "@/components/BoostModal";
import BuyerIntentBadge from "@/components/BuyerIntentBadge";
import CompetitorInsights from "@/components/CompetitorInsights";

type ListingStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "SOLD" | "REMOVED";

interface DashboardListing {
  id: string;
  title: string;
  price: string | number | null;
  priceType: string;
  status: ListingStatus;
  viewsCount: number;
  whatsappClicks: number;
  createdAt: string;
  images: { url: string; thumbnailUrl: string | null }[];
  category: { name: string };
  isBoosted: boolean;
  isFeatured: boolean;
  boostExpires: string | null;
  featureExpires: string | null;
}

interface DashboardClientProps {
  listings: DashboardListing[];
  stats: {
    total: number;
    active: number;
    totalViews: number;
    totalWhatsappClicks: number;
  };
}

const STATUS_TABS: { label: string; value: ListingStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Sold", value: "SOLD" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Draft", value: "DRAFT" },
];

const STATUS_STYLES: Record<ListingStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  SOLD: "bg-gray-100 text-gray-600",
  EXPIRED: "bg-yellow-100 text-yellow-700",
  DRAFT: "bg-blue-100 text-blue-700",
  REMOVED: "bg-red-100 text-red-700",
};

export default function DashboardClient({
  listings: initialListings,
  stats,
}: DashboardClientProps) {
  const [listings, setListings] = useState(initialListings);
  const [activeTab, setActiveTab] = useState<ListingStatus | "ALL">("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [boostModal, setBoostModal] = useState<{
    isOpen: boolean;
    listingId: string;
    listingTitle: string;
    mode: "boost" | "feature";
  }>({ isOpen: false, listingId: "", listingTitle: "", mode: "boost" });
  const [buyerIntentMap, setBuyerIntentMap] = useState<Record<string, number>>({});
  const [insightsOpen, setInsightsOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/analytics/buyer-intent")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const map: Record<string, number> = {};
          data.forEach((item: { listingId: string; interestedBuyers: number }) => {
            map[item.listingId] = item.interestedBuyers;
          });
          setBuyerIntentMap(map);
        }
      })
      .catch(() => {});
  }, []);

  const filtered =
    activeTab === "ALL"
      ? listings
      : listings.filter((l) => l.status === activeTab);

  async function handleMarkAsSold(id: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SOLD" }),
      });
      if (res.ok) {
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: "SOLD" as ListingStatus } : l))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Listings"
          value={stats.total}
          icon={<Package className="w-5 h-5 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Active Listings"
          value={stats.active}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          bgColor="bg-green-50"
        />
        <StatCard
          label="Total Views"
          value={stats.totalViews}
          icon={<Eye className="w-5 h-5 text-purple-600" />}
          bgColor="bg-purple-50"
        />
        <StatCard
          label="WhatsApp Clicks"
          value={stats.totalWhatsappClicks}
          icon={<MessageCircle className="w-5 h-5 text-emerald-600" />}
          bgColor="bg-emerald-50"
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-1 p-3 border-b border-gray-100 overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
                activeTab === tab.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {tab.label}
              {tab.value === "ALL" && (
                <span className="ml-1 text-xs opacity-75">({listings.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Listings Table */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No listings found</p>
            <p className="text-sm mt-1">
              {activeTab === "ALL"
                ? "Create your first listing to get started."
                : `No ${activeTab.toLowerCase()} listings.`}
            </p>
            {activeTab === "ALL" && (
              <Link
                href="/listings/new"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Create Listing
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Table Header - hidden on mobile */}
            <div className="hidden md:grid md:grid-cols-[1fr,auto,auto,auto,auto] gap-4 px-4 py-2.5 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <span>Listing</span>
              <span className="w-20 text-center">Status</span>
              <span className="w-16 text-center">Views</span>
              <span className="w-16 text-center">Clicks</span>
              <span className="w-48 text-center">Actions</span>
            </div>

            {filtered.map((listing) => {
              const imageUrl =
                listing.images[0]?.thumbnailUrl || listing.images[0]?.url || null;
              const isDeleting = deletingId === listing.id;
              const isUpdating = updatingId === listing.id;

              return (
                <div
                  key={listing.id}
                  className={cn(
                    "flex flex-col md:grid md:grid-cols-[1fr,auto,auto,auto,auto] gap-3 md:gap-4 md:items-center p-4 hover:bg-gray-50/50 transition",
                    isDeleting && "opacity-50 pointer-events-none"
                  )}
                >
                  {/* Listing Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="font-medium text-gray-900 text-sm hover:text-blue-600 transition line-clamp-1"
                        >
                          {listing.title}
                        </Link>
                        {listing.status === "ACTIVE" && buyerIntentMap[listing.id] > 0 && (
                          <BuyerIntentBadge
                            listingId={listing.id}
                            count={buyerIntentMap[listing.id]}
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {listing.category.name} &middot;{" "}
                        {listing.priceType === "FREE"
                          ? "Free"
                          : listing.priceType === "CONTACT"
                            ? "Contact"
                            : formatPrice(listing.price)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {timeAgo(listing.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="md:w-20 flex md:justify-center">
                    <span
                      className={cn(
                        "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium",
                        STATUS_STYLES[listing.status] || "bg-gray-100 text-gray-600"
                      )}
                    >
                      {listing.status}
                    </span>
                  </div>

                  {/* Views */}
                  <div className="md:w-16 flex items-center gap-1 md:justify-center text-sm text-gray-600">
                    <Eye className="w-3.5 h-3.5 md:hidden" />
                    {listing.viewsCount.toLocaleString()}
                  </div>

                  {/* WhatsApp Clicks */}
                  <div className="md:w-16 flex items-center gap-1 md:justify-center text-sm text-gray-600">
                    <MessageCircle className="w-3.5 h-3.5 md:hidden" />
                    {listing.whatsappClicks.toLocaleString()}
                  </div>

                  {/* Actions */}
                  <div className="md:w-48 flex items-center gap-1 md:justify-center flex-wrap">
                    <Link
                      href={`/listings/${listing.id}/edit`}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    {listing.status === "ACTIVE" && (
                      <>
                        <button
                          onClick={() => handleMarkAsSold(listing.id)}
                          disabled={isUpdating}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                          title="Mark as Sold"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        {listing.isBoosted && listing.boostExpires ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
                            title={`Boosted until ${new Date(listing.boostExpires).toLocaleDateString()}`}
                          >
                            <Zap className="w-3 h-3" />
                            Boosted
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              setBoostModal({
                                isOpen: true,
                                listingId: listing.id,
                                listingTitle: listing.title,
                                mode: "boost",
                              })
                            }
                            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            title="Boost"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                        )}
                        {listing.isFeatured && listing.featureExpires ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                            title={`Featured until ${new Date(listing.featureExpires).toLocaleDateString()}`}
                          >
                            <Star className="w-3 h-3" />
                            Featured
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              setBoostModal({
                                isOpen: true,
                                listingId: listing.id,
                                listingTitle: listing.title,
                                mode: "feature",
                              })
                            }
                            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Feature"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(listing.id)}
                      disabled={isDeleting}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {listing.status === "ACTIVE" && (
                      <button
                        onClick={() =>
                          setInsightsOpen((prev) => ({
                            ...prev,
                            [listing.id]: !prev[listing.id],
                          }))
                        }
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg transition",
                          insightsOpen[listing.id]
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                        )}
                        title="Competitor Insights"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Insights
                      </button>
                    )}
                  </div>

                  {/* Competitor Insights Expansion */}
                  {listing.status === "ACTIVE" && insightsOpen[listing.id] && (
                    <div className="md:col-span-5">
                      <CompetitorInsights listingId={listing.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BoostModal
        isOpen={boostModal.isOpen}
        onClose={() => setBoostModal((prev) => ({ ...prev, isOpen: false }))}
        listingId={boostModal.listingId}
        listingTitle={boostModal.listingTitle}
        mode={boostModal.mode}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  bgColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            bgColor
          )}
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
