"use client";

import { ThumbsUp, Check } from "lucide-react";

interface DealScoreBadgeProps {
  score: string | null;
  percentage: number;
  compact?: boolean;
}

export default function DealScoreBadge({
  score,
  percentage,
  compact = false,
}: DealScoreBadgeProps) {
  if (!score) return null;

  const config: Record<
    string,
    { label: string; icon: React.ReactNode; bg: string; text: string }
  > = {
    great_deal: {
      label: "Great Deal",
      icon: <ThumbsUp className="w-3.5 h-3.5" />,
      bg: "bg-green-100",
      text: "text-green-700",
    },
    fair_price: {
      label: "Fair Price",
      icon: <Check className="w-3.5 h-3.5" />,
      bg: "bg-blue-100",
      text: "text-blue-700",
    },
    above_market: {
      label: "Above Market",
      icon: null,
      bg: "bg-gray-100",
      text: "text-gray-600",
    },
  };

  const c = config[score];
  if (!c) return null;

  const percentLabel =
    percentage < 0
      ? `${Math.abs(percentage)}% below average`
      : percentage > 0
        ? `${percentage}% above average`
        : "At average";

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
        title={percentLabel}
      >
        {c.icon}
        {c.label}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${c.bg} ${c.text}`}
    >
      {c.icon}
      <span>{c.label}</span>
      <span className="opacity-70 text-xs">{percentLabel}</span>
    </div>
  );
}
