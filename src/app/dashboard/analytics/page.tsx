"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Eye, MessageCircle, Heart, ArrowLeft } from "lucide-react";

interface ListingStat {
  id: string;
  title: string;
  viewsCount: number;
  whatsappClicks: number;
  favouriteCount: number;
}

interface AnalyticsData {
  totalViews: number;
  totalWhatsappClicks: number;
  totalFavourites: number;
  listings: ListingStat[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) {
          setAuthorized(false);
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((user) => {
        if (!user) return;
        return fetch("/api/analytics")
          .then((r) => r.json())
          .then((d) => setData(d));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Please log in to view analytics.</p>
      </div>
    );
  }

  if (!data) return null;

  const maxViews = Math.max(...data.listings.map((l) => l.viewsCount), 1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard"
          className="p-2 text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.totalViews.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">WhatsApp Clicks</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.totalWhatsappClicks.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Favourites</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.totalFavourites.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Table */}
      {data.listings.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No listings yet. Post your first ad to see analytics.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Listing Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 font-medium text-gray-500">Listing</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-right">Views</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-right">Clicks</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-right">Favourites</th>
                  <th className="px-5 py-3 font-medium text-gray-500 w-48">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {listing.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-700">
                      {listing.viewsCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-700">
                      {listing.whatsappClicks.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-700">
                      {listing.favouriteCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all"
                          style={{
                            width: `${(listing.viewsCount / maxViews) * 100}%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
