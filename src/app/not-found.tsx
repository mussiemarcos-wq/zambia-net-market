"use client";

import Link from "next/link";
import { Search, Home, ShoppingBag } from "lucide-react";
import { useState } from "react";

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">Z</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Zambia.net Marketplace
          </span>
        </div>

        <h1 className="text-8xl font-extrabold text-gray-200 dark:text-gray-700">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4">
          Page not found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          The listing may have been removed or the link is incorrect.
        </p>

        <form onSubmit={handleSearch} className="mt-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </form>

        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Listings
          </Link>
        </div>
      </div>
    </div>
  );
}
