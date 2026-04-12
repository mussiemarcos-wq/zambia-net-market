"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Check, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface SaveSearchButtonProps {
  query?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  location?: string;
}

interface SavedSearch {
  id: string;
  query: string | null;
  categorySlug: string | null;
  minPrice: string | null;
  maxPrice: string | null;
  location: string | null;
}

export default function SaveSearchButton({
  query,
  category,
  minPrice,
  maxPrice,
  location,
}: SaveSearchButtonProps) {
  const { user, openAuthModal } = useAppStore();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const hasFilters = !!(query || category || minPrice || maxPrice || location);

  // Check if this search is already saved
  useEffect(() => {
    if (!user || !hasFilters) {
      setChecking(false);
      return;
    }

    async function checkSaved() {
      try {
        const res = await fetch("/api/saved-searches");
        if (!res.ok) return;
        const searches: SavedSearch[] = await res.json();

        const match = searches.find(
          (s) =>
            (s.query || "") === (query || "") &&
            (s.categorySlug || "") === (category || "") &&
            (s.minPrice || "") === (minPrice || "") &&
            (s.maxPrice || "") === (maxPrice || "") &&
            (s.location || "") === (location || "")
        );

        if (match) setSavedId(match.id);
      } catch {
        // Ignore errors
      } finally {
        setChecking(false);
      }
    }

    checkSaved();
  }, [user, query, category, minPrice, maxPrice, location, hasFilters]);

  if (!hasFilters) return null;

  async function handleToggle() {
    if (!user) {
      openAuthModal("login");
      return;
    }

    setLoading(true);
    try {
      if (savedId) {
        // Unsave
        const res = await fetch(`/api/saved-searches/${savedId}`, {
          method: "DELETE",
        });
        if (res.ok) setSavedId(null);
      } else {
        // Save
        const res = await fetch("/api/saved-searches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: query || undefined,
            categorySlug: category || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            location: location || undefined,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setSavedId(data.id);
        }
      }
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }

  if (checking) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
        savedId
          ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      } disabled:opacity-50`}
      title={savedId ? "Remove saved search" : "Save this search to get alerts"}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : savedId ? (
        <Check className="w-4 h-4" />
      ) : (
        <Bell className="w-4 h-4" />
      )}
      {savedId ? "Search saved" : "Save search"}
    </button>
  );
}
