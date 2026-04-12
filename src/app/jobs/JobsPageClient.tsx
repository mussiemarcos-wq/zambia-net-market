"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import JobListingCard from "@/components/JobListingCard";

interface JobListing {
  id: string;
  title: string;
  description: string | null;
  price: string | number | null;
  priceType: string;
  location: string | null;
  viewsCount: number;
  createdAt: string;
  subcategory: { name: string; slug: string } | null;
  user: {
    id: string;
    name: string;
    phone: string;
    isVerified: boolean;
    avatarUrl: string | null;
  };
  images: { url: string; thumbnailUrl: string | null }[];
}

interface Subcategory {
  name: string;
  slug: string;
}

interface JobsPageClientProps {
  listings: JobListing[];
  subcategories: Subcategory[];
}

type SortOption = "newest" | "most_viewed";

export default function JobsPageClient({
  listings,
  subcategories,
}: JobsPageClientProps) {
  const [search, setSearch] = useState("");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    null
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...listings];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q) ||
          l.location?.toLowerCase().includes(q) ||
          l.user.name.toLowerCase().includes(q)
      );
    }

    // Subcategory filter
    if (activeSubcategory) {
      result = result.filter(
        (l) => l.subcategory?.slug === activeSubcategory
      );
    }

    // Sort
    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "most_viewed") {
      result.sort((a, b) => b.viewsCount - a.viewsCount);
    }

    return result;
  }, [listings, search, activeSubcategory, sortBy]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar - visible on large screens, toggleable on small */}
      <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
        <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Job Type
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => setActiveSubcategory(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                !activeSubcategory
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Jobs
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.slug}
                onClick={() =>
                  setActiveSubcategory(
                    activeSubcategory === sub.slug ? null : sub.slug
                  )
                }
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                  activeSubcategory === sub.slug
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>

          <hr className="my-4 border-gray-200" />

          <h3 className="text-sm font-semibold text-gray-900 mb-3">Sort By</h3>
          <div className="space-y-1">
            <button
              onClick={() => setSortBy("newest")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                sortBy === "newest"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Newest First
            </button>
            <button
              onClick={() => setSortBy("most_viewed")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                sortBy === "most_viewed"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Most Viewed
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Search bar + mobile filter toggle */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search job titles, companies, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Active filters display */}
        {(activeSubcategory || search) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {activeSubcategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {subcategories.find((s) => s.slug === activeSubcategory)?.name}
                <button
                  onClick={() => setActiveSubcategory(null)}
                  className="ml-0.5 hover:text-blue-600"
                >
                  &times;
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                &quot;{search}&quot;
                <button
                  onClick={() => setSearch("")}
                  className="ml-0.5 hover:text-gray-500"
                >
                  &times;
                </button>
              </span>
            )}
            <span className="text-xs text-gray-500">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Job listings */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-2">No jobs found</p>
            <p className="text-gray-400 text-sm">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((listing) => (
              <JobListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
