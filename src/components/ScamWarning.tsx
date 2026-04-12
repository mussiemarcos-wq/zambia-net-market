"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useState } from "react";

interface ScamWarningProps {
  warnings: string[];
  isHighRisk?: boolean;
}

export default function ScamWarning({
  warnings,
  isHighRisk = false,
}: ScamWarningProps) {
  const [expanded, setExpanded] = useState(false);

  if (!warnings || warnings.length === 0) return null;

  if (isHighRisk) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-800 text-sm">
              This listing has been flagged for review
            </p>
            <ul className="mt-2 space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="text-sm text-red-700 flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">&#8226;</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="font-semibold text-yellow-800 text-sm hover:underline text-left"
          >
            Be cautious: {warnings.length} potential{" "}
            {warnings.length === 1 ? "concern" : "concerns"} detected
            <span className="ml-1 text-yellow-600">
              {expanded ? "[-]" : "[+]"}
            </span>
          </button>
          {expanded && (
            <ul className="mt-2 space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="text-sm text-yellow-700 flex items-start gap-1.5">
                  <span className="text-yellow-400 mt-0.5">&#8226;</span>
                  {w}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
