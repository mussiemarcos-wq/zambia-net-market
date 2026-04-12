"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface QualityScoreProps {
  score: number;
  grade: string;
  tips: string[];
  compact?: boolean;
}

const GRADE_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  A: { bg: "bg-green-100", text: "text-green-700", ring: "ring-green-500" },
  B: { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-500" },
  C: { bg: "bg-yellow-100", text: "text-yellow-700", ring: "ring-yellow-500" },
  D: { bg: "bg-red-100", text: "text-red-700", ring: "ring-red-500" },
};

const GRADE_LABELS: Record<string, string> = {
  A: "Excellent",
  B: "Good",
  C: "Fair",
  D: "Needs Improvement",
};

export default function QualityScore({
  score,
  grade,
  tips,
  compact = false,
}: QualityScoreProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = GRADE_COLORS[grade] || GRADE_COLORS.D;

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}
        title={`Quality Score: ${score}/100 (${GRADE_LABELS[grade]})`}
      >
        <span className="font-bold">{grade}</span>
        <span className="opacity-75">{score}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Listing Quality
        </h3>
        <div className="flex items-center gap-3">
          {/* Circular badge */}
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="4"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${(score / 100) * 150.8} 150.8`}
                strokeLinecap="round"
                className={colors.text}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-bold ${colors.text}`}>
                {grade}
              </span>
            </div>
          </div>
          <div>
            <p className={`text-sm font-semibold ${colors.text}`}>
              {GRADE_LABELS[grade]}
            </p>
            <p className="text-xs text-gray-500">{score}/100 points</p>
          </div>
        </div>
      </div>

      {tips.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {expanded ? (
              <>
                Hide tips <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                {tips.length} tip{tips.length !== 1 ? "s" : ""} to improve{" "}
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
          {expanded && (
            <ul className="mt-2 space-y-2">
              {tips.map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <span className="text-blue-400 mt-0.5">&#8227;</span>
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
