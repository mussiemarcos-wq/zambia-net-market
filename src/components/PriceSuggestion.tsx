"use client";

import { useState, useEffect } from "react";
import { Info } from "lucide-react";

interface PriceSuggestionProps {
  categoryId: string;
  condition?: string;
}

interface PriceData {
  min: number;
  max: number;
  average: number;
  median: number;
  count: number;
  currency: string;
}

export default function PriceSuggestion({ categoryId, condition }: PriceSuggestionProps) {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categoryId) {
      setData(null);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ categoryId });
    if (condition) params.set("condition", condition);

    fetch(`/api/listings/price-suggestion?${params}`)
      .then((res) => res.json())
      .then((json) => {
        const result = json.count !== undefined ? json : json.data ?? json;
        if (result.count > 0) {
          setData(result);
        } else {
          setData(null);
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [categoryId, condition]);

  if (loading || !data) return null;

  function formatK(value: number) {
    return `K${value.toLocaleString()}`;
  }

  return (
    <div className="mt-2 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
      <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-blue-700">
        <span className="font-medium">
          Similar items sell for {formatK(data.min)} - {formatK(data.max)}
        </span>
        <span className="text-blue-500">
          {" "}(avg {formatK(data.average)})
        </span>
        <span className="text-blue-400 text-xs ml-1">
          based on {data.count} listing{data.count !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
