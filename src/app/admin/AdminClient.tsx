"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Star,
  Loader2,
} from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";

type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";

interface AdminReport {
  id: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  createdAt: string;
  reporter: { name: string };
  listing: {
    id: string;
    title: string;
    user: { id: string; name: string };
  } | null;
}

interface AdminListing {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string };
  category: { name: string };
}

interface AdminReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { id: string; name: string };
  seller: { id: string; name: string };
}

interface AdminClientProps {
  reports: AdminReport[];
  recentListings: AdminListing[];
  recentReviews: AdminReview[];
}

const REPORT_STATUS_STYLES: Record<ReportStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  REVIEWED: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  DISMISSED: "bg-gray-100 text-gray-600",
};

export default function AdminClient({
  reports: initialReports,
  recentListings: initialListings,
  recentReviews: initialReviews,
}: AdminClientProps) {
  const [reports, setReports] = useState(initialReports);
  const [listings, setListings] = useState(initialListings);
  const [reviews, setReviews] = useState(initialReviews);
  const [processingReport, setProcessingReport] = useState<string | null>(null);
  const [processingListing, setProcessingListing] = useState<string | null>(null);
  const [processingReview, setProcessingReview] = useState<string | null>(null);
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const allSelected =
    listings.length > 0 && selectedListings.size === listings.length;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedListings(new Set());
    } else {
      setSelectedListings(new Set(listings.map((l) => l.id)));
    }
  }

  function toggleSelectListing(id: string) {
    setSelectedListings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleBulkAction(action: "remove" | "approve") {
    const count = selectedListings.size;
    const actionLabel =
      action === "remove"
        ? `remove ${count} selected listing${count !== 1 ? "s" : ""}`
        : `approve ${count} selected listing${count !== 1 ? "s" : ""}`;

    if (!confirm(`Are you sure you want to ${actionLabel}?`)) return;

    setBulkProcessing(true);
    try {
      const ids = Array.from(selectedListings);
      const results = await Promise.allSettled(
        ids.map((id) => {
          if (action === "remove") {
            return fetch(`/api/listings/${id}`, { method: "DELETE" });
          } else {
            return fetch(`/api/listings/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "ACTIVE" }),
            });
          }
        })
      );

      const succeededIds: string[] = [];
      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.ok) {
          succeededIds.push(ids[index]);
        }
      });

      if (action === "remove") {
        setListings((prev) =>
          prev.filter((l) => !succeededIds.includes(l.id))
        );
      } else {
        setListings((prev) =>
          prev.map((l) =>
            succeededIds.includes(l.id) ? { ...l, status: "ACTIVE" } : l
          )
        );
      }
      setSelectedListings(new Set());
    } finally {
      setBulkProcessing(false);
    }
  }

  async function handleReportAction(
    reportId: string,
    action: "resolve" | "dismiss" | "remove"
  ) {
    const actionLabel =
      action === "resolve"
        ? "resolve this report"
        : action === "dismiss"
          ? "dismiss this report"
          : "remove the reported listing";

    if (!confirm(`Are you sure you want to ${actionLabel}?`)) return;

    setProcessingReport(reportId);
    try {
      const report = reports.find((r) => r.id === reportId);

      if (action === "remove" && report?.listing) {
        await fetch(`/api/listings/${report.listing.id}`, {
          method: "DELETE",
        });
        setListings((prev) =>
          prev.filter((l) => l.id !== report.listing!.id)
        );
      }

      const newStatus: ReportStatus =
        action === "dismiss" ? "DISMISSED" : "RESOLVED";
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: newStatus } : r
        )
      );
    } finally {
      setProcessingReport(null);
    }
  }

  async function handleRemoveListing(listingId: string) {
    if (
      !confirm(
        "Are you sure you want to remove this listing? This cannot be undone."
      )
    ) {
      return;
    }

    setProcessingListing(listingId);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== listingId));
      }
    } finally {
      setProcessingListing(null);
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setProcessingReview(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }
    } finally {
      setProcessingReview(null);
    }
  }

  const pendingReports = reports.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-8">
      {/* Reports Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h2 className="font-semibold text-gray-900">Reports</h2>
            {pendingReports.length > 0 && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                {pendingReports.length} pending
              </span>
            )}
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Shield className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No reports to review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => {
                  const isProcessing = processingReport === report.id;
                  return (
                    <tr
                      key={report.id}
                      className={cn(
                        "hover:bg-gray-50/50 transition",
                        isProcessing && "opacity-50 pointer-events-none"
                      )}
                    >
                      <td className="px-4 py-3">
                        {report.listing ? (
                          <div>
                            <Link
                              href={`/listings/${report.listing.id}`}
                              className="font-medium text-gray-900 hover:text-blue-600 transition flex items-center gap-1"
                            >
                              {report.listing.title}
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5">
                              by {report.listing.user.name}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">
                            Listing removed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {report.reporter.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-medium">
                          {report.reason}
                        </span>
                        {report.description && (
                          <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {report.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                            REPORT_STATUS_STYLES[report.status]
                          )}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {timeAgo(report.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {report.status === "PENDING" && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() =>
                                handleReportAction(report.id, "resolve")
                              }
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Resolve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleReportAction(report.id, "dismiss")
                              }
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                              title="Dismiss"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            {report.listing && (
                              <button
                                onClick={() =>
                                  handleReportAction(report.id, "remove")
                                }
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Remove Listing"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Listings Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Listings</h2>
        </div>

        {/* Bulk Action Bar */}
        {selectedListings.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border-b border-blue-100">
            <span className="text-sm font-medium text-blue-700">
              {selectedListings.size} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction("remove")}
                disabled={bulkProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {bulkProcessing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                Remove Selected
              </button>
              <button
                onClick={() => handleBulkAction("approve")}
                disabled={bulkProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {bulkProcessing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                Approve Selected
              </button>
            </div>
            <button
              onClick={() => setSelectedListings(new Set())}
              className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear selection
            </button>
          </div>
        )}

        {listings.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-sm">No listings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Seller</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map((listing) => {
                  const isProcessing = processingListing === listing.id;
                  const isSelected = selectedListings.has(listing.id);
                  return (
                    <tr
                      key={listing.id}
                      className={cn(
                        "hover:bg-gray-50/50 transition",
                        isProcessing && "opacity-50 pointer-events-none",
                        isSelected && "bg-blue-50/50"
                      )}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectListing(listing.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition flex items-center gap-1"
                        >
                          {listing.title}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {listing.user.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {listing.category.name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                            listing.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : listing.status === "SOLD"
                                ? "bg-gray-100 text-gray-600"
                                : listing.status === "DRAFT"
                                  ? "bg-blue-100 text-blue-700"
                                  : listing.status === "REMOVED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                          )}
                        >
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {timeAgo(listing.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleRemoveListing(listing.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          <Star className="w-5 h-5 text-yellow-500" />
          <h2 className="font-semibold text-gray-900">Recent Reviews</h2>
        </div>

        {reviews.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-sm">No reviews found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Reviewer</th>
                  <th className="px-4 py-3">Seller</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((review) => {
                  const isProcessing = processingReview === review.id;
                  return (
                    <tr
                      key={review.id}
                      className={cn(
                        "hover:bg-gray-50/50 transition",
                        isProcessing && "opacity-50 pointer-events-none"
                      )}
                    >
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {review.reviewer.name}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/sellers/${review.seller.id}`}
                          className="text-gray-900 hover:text-blue-600 transition flex items-center gap-1"
                        >
                          {review.seller.name}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-3.5 h-3.5",
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-none text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                        {review.comment || (
                          <span className="text-gray-400 italic">
                            No comment
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {timeAgo(review.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
