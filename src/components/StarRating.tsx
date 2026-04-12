"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const SIZE_MAP = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-7 h-7",
};

export default function StarRating({
  rating,
  maxStars = 5,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;
  const filledStars = Math.floor(displayRating);
  const iconClass = SIZE_MAP[size];

  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const starIndex = i + 1;
        const isFilled = starIndex <= filledStars;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            className={cn(
              "p-0 border-0 bg-transparent",
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : "cursor-default"
            )}
            onMouseEnter={() => interactive && setHoverRating(starIndex)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onChange?.(starIndex)}
            aria-label={`${starIndex} star${starIndex > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                iconClass,
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-none text-gray-300"
              )}
            />
          </button>
        );
      })}
      {interactive && displayRating > 0 && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {displayRating}
        </span>
      )}
    </div>
  );
}
