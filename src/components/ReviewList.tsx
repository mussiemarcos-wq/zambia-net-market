"use client";

import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";
import { timeAgo } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface ReviewListProps {
  sellerId: string;
  sellerName: string;
  currentUserId?: string;
}

export default function ReviewList({
  sellerId,
  sellerName,
  currentUserId,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const openAuthModal = useAppStore((s) => s.openAuthModal);

  const fetchReviews = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      setFetchError(false);
      // Safety timeout - never leave in a stuck loading state
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setInitialLoaded(true);
      }, 10000);
      try {
        const res = await fetch(
          `/api/reviews?sellerId=${sellerId}&page=${pageNum}&limit=10`
        );
        if (res.ok) {
          const data = await res.json();
          setReviews((prev) =>
            append ? [...prev, ...(data.reviews || [])] : (data.reviews || [])
          );
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
          setPage(data.page || 1);
        } else {
          setFetchError(true);
          if (!append) setReviews([]);
        }
      } catch {
        setFetchError(true);
        if (!append) setReviews([]);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
        setInitialLoaded(true);
      }
    },
    [sellerId]
  );

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  function handleLoadMore() {
    if (page < totalPages) {
      fetchReviews(page + 1, true);
    }
  }

  function handleReviewSubmit() {
    fetchReviews(1, false);
  }

  function handleWriteReview() {
    if (!currentUserId) {
      openAuthModal("login");
      return;
    }
    setShowForm(true);
  }

  const canReview = currentUserId && currentUserId !== sellerId;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">
          Reviews ({total})
        </h2>
        {canReview && (
          <button
            onClick={handleWriteReview}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <Star className="w-4 h-4" />
            Write a Review
          </button>
        )}
      </div>

      {!initialLoaded ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-sm">Loading reviews...</p>
        </div>
      ) : fetchError && reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Couldn&apos;t load reviews right now</p>
          <button
            onClick={() => fetchReviews(1)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Try again
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No reviews yet</p>
          {canReview && (
            <p className="text-sm text-gray-400 mt-1">
              Be the first to review this seller
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const initial = review.reviewer.name.charAt(0).toUpperCase();
            return (
              <div
                key={review.id}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {review.reviewer.avatarUrl ? (
                      <img
                        src={review.reviewer.avatarUrl}
                        alt={review.reviewer.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-blue-600">
                        {initial}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">
                        {review.reviewer.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {timeAgo(review.createdAt)}
                      </span>
                    </div>
                    <div className="mt-1">
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 text-sm mt-2 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {page < totalPages && (
            <div className="text-center pt-2">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <ReviewForm
          sellerId={sellerId}
          sellerName={sellerName}
          onClose={() => setShowForm(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
