"use client";

import { cn } from "@/lib/utils";

interface BuyerIntentBadgeProps {
  listingId: string;
  count: number;
}

export default function BuyerIntentBadge({ count }: BuyerIntentBadgeProps) {
  if (count === 0) return null;

  const isHighIntent = count > 5;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
        isHighIntent
          ? "bg-amber-200 text-amber-800 font-bold"
          : "bg-amber-100 text-amber-700 font-medium"
      )}
      title={`${count} people are actively searching for items like this`}
    >
      <span className="leading-none">&#128101;</span> {count} buyer{count !== 1 ? "s" : ""} looking
    </span>
  );
}
