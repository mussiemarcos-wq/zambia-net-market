"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  PackageOpen,
  LayoutGrid,
  Map,
  ArrowUp,
  Loader2,
} from "lucide-react";
import ListingCard from "@/components/ListingCard";
import SaveSearchButton from "@/components/SaveSearchButton";
import CategorySponsor from "@/components/CategorySponsor";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });
import {
  CATEGORIES_WITH_SUBS,
  CONDITION_LABELS,
} from "@/lib/constants";

interface ListingImage {
  url: string;
  thumbnailUrl: string | null;
}

interface ListingUser {
  id: string;
  name: string;
  isVerified: boolean;
  avatarUrl: string | null;
}

interface Listing {
  id: string;
  title: string;
  price: string | number | null;
  priceType: string;
  location: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  condition: string;
  isFeatured: boolean;
  isBoosted: boolean;
  viewsCount: number;
  createdAt: string;
  images: ListingImage[];
  user: ListingUser;
  category: { name: string };
}

interface ApiResponse {
  listings: Listing[];
  total: number;
  page: number;
  totalPages: number;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Read filters from URL
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const condition = searchParams.get("condition") || "";
  const sort = searchParams.get("sort") || "newest";

  // Local filter state for inputs (committed on apply)
  const [searchText, setSearchText] = useState(q);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    category || null
  );

  // Sync local state when URL changes
  useEffect(() => {
    setSearchText(q);
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [q, minPrice, maxPrice]);

  // Build URL and navigate
  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      // Reset to page 1 when filters change (unless explicitly setting page)
      if (!("page" in updates)) {
        params.delete("page");
      }
      router.push(`/search?${params.toString()}`);
    },
    [searchParams, router]
  );

  // Reset listings when filters change
  useEffect(() => {
    setListings([]);
    setCurrentPage(1);
    setTotalPages(0);
    setTotal(0);
  }, [q, category, subcategory, minPrice, maxPrice, condition, sort]);

  // Fetch listings
  useEffect(() => {
    const controller = new AbortController();

    async function fetchListings() {
      const isFirstPage = currentPage === 1;
      if (isFirstPage) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("limit", "20");
        if (q) params.set("search", q);
        if (category) params.set("category", category);
        if (subcategory) params.set("subcategory", subcategory);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (condition) params.set("condition", condition);
        if (sort) params.set("sort", sort);

        const res = await fetch(`/api/listings?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data: ApiResponse = await res.json();

        if (isFirstPage) {
          setListings(data.listings);
        } else {
          setListings((prev) => [...prev, ...data.listings]);
        }
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Error fetching listings:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }

    fetchListings();
    return () => controller.abort();
  }, [q, category, subcategory, minPrice, maxPrice, condition, sort, currentPage]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          !loadingMore &&
          currentPage < totalPages
        ) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, loadingMore, currentPage, totalPages]);

  // Show/hide back to top button
  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 800);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilters({ q: searchText });
  }

  function handlePriceApply() {
    updateFilters({ minPrice: localMinPrice, maxPrice: localMaxPrice });
  }

  function clearAllFilters() {
    router.push("/search");
  }

  const selectedConditions = condition ? condition.split(",") : [];

  function toggleCondition(value: string) {
    const next = selectedConditions.includes(value)
      ? selectedConditions.filter((c) => c !== value)
      : [...selectedConditions, value];
    updateFilters({ condition: next.join(",") });
  }

  const hasActiveFilters =
    q || category || subcategory || minPrice || maxPrice || condition;

  // Selected category object for showing subcategories
  const selectedCategoryObj = CATEGORIES_WITH_SUBS.find(
    (c) => c.slug === (expandedCategory || category)
  );

  // -- Sidebar content (shared between desktop and mobile) --
  const filterSidebar = (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => updateFilters({ category: "", subcategory: "" })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                !category
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Categories
            </button>
          </li>
          {CATEGORIES_WITH_SUBS.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() => {
                  if (category === cat.slug) {
                    setExpandedCategory(
                      expandedCategory === cat.slug ? null : cat.slug
                    );
                  } else {
                    updateFilters({ category: cat.slug, subcategory: "" });
                    setExpandedCategory(cat.slug);
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between ${
                  category === cat.slug
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>
                  {cat.icon} {cat.name}
                </span>
                {cat.subcategories.length > 0 &&
                  (expandedCategory === cat.slug ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  ))}
              </button>
              {expandedCategory === cat.slug && (
                <ul className="ml-4 mt-1 space-y-1">
                  {cat.subcategories.map((sub) => (
                    <li key={sub.slug}>
                      <button
                        onClick={() =>
                          updateFilters({
                            category: cat.slug,
                            subcategory: sub.slug,
                          })
                        }
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                          subcategory === sub.slug
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {sub.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handlePriceApply}
          className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition"
        >
          Apply Price
        </button>
      </div>

      {/* Condition */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Condition</h3>
        <div className="space-y-2">
          {Object.entries(CONDITION_LABELS).map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedConditions.includes(value)}
                onChange={() => toggleCondition(value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
        <select
          value={sort}
          onChange={(e) => updateFilters({ sort: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full text-sm text-red-600 hover:text-red-700 font-medium py-2"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search bar + mobile filter toggle */}
      <div className="flex gap-3 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search listings..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="lg:hidden flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Active filter tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {q && (
            <FilterTag
              label={`"${q}"`}
              onRemove={() => updateFilters({ q: "" })}
            />
          )}
          {category && (
            <FilterTag
              label={
                CATEGORIES_WITH_SUBS.find((c) => c.slug === category)?.name ||
                category
              }
              onRemove={() => updateFilters({ category: "", subcategory: "" })}
            />
          )}
          {subcategory && (
            <FilterTag
              label={
                selectedCategoryObj?.subcategories.find(
                  (s) => s.slug === subcategory
                )?.name || subcategory
              }
              onRemove={() => updateFilters({ subcategory: "" })}
            />
          )}
          {(minPrice || maxPrice) && (
            <FilterTag
              label={`K${minPrice || "0"} - K${maxPrice || "..."}`}
              onRemove={() => updateFilters({ minPrice: "", maxPrice: "" })}
            />
          )}
          {selectedConditions.map((c) => (
            <FilterTag
              key={c}
              label={CONDITION_LABELS[c] || c}
              onRemove={() => toggleCondition(c)}
            />
          ))}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-6">{filterSidebar}</div>
        </aside>

        {/* Mobile Filter Panel */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">{filterSidebar}</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Category Sponsor */}
          {category && <CategorySponsor categorySlug={category} />}

          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500">
                {loading
                  ? "Searching..."
                  : `${total} listing${total !== 1 ? "s" : ""} found`}
              </p>
              <SaveSearchButton
                query={q}
                category={category}
                minPrice={minPrice}
                maxPrice={maxPrice}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`p-1.5 ${viewMode === "map" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                  title="Map view"
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>
              <select
                value={sort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="hidden sm:block border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {!loading && listings.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {/* Map View */}
          {!loading && listings.length > 0 && viewMode === "map" && (
            <MapView
              listings={listings
                .filter((l) => l.latitude != null && l.longitude != null)
                .map((l) => ({
                  id: l.id,
                  title: l.title,
                  price: l.price != null ? Number(l.price) : null,
                  latitude: Number(l.latitude),
                  longitude: Number(l.longitude),
                  image: l.images[0]?.url,
                }))}
            />
          )}

          {/* Empty State */}
          {!loading && listings.length === 0 && (
            <div className="text-center py-20">
              <PackageOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No listings found
              </h3>
              <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                Try adjusting your search or filters to find what you are looking
                for.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1" />

          {/* Loading more spinner */}
          {loadingMore && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <span className="text-sm text-gray-500">Loading more listings...</span>
            </div>
          )}

          {/* End of results */}
          {!loading && !loadingMore && listings.length > 0 && currentPage >= totalPages && (
            <p className="text-center text-sm text-gray-400 py-8">
              All {total} listings loaded.
            </p>
          )}
        </div>
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
          title="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

function FilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-blue-100 rounded-full p-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

