"use client";

interface FreshnessIndicatorProps {
  createdAt: string;
  expiresAt?: string | null;
}

export default function FreshnessIndicator({
  createdAt,
  expiresAt,
}: FreshnessIndicatorProps) {
  const now = new Date();
  const created = new Date(createdAt);
  const ageMs = now.getTime() - created.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  const ageDays = ageHours / 24;

  // Check expiration first
  if (expiresAt) {
    const expires = new Date(expiresAt);
    const daysUntilExpiry = (expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntilExpiry > 0 && daysUntilExpiry <= 3) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-orange-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
          Expiring soon
        </span>
      );
    }
  }

  if (ageHours < 1) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
        Just posted
      </span>
    );
  }

  if (ageHours < 24) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600">
        <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
        Fresh
      </span>
    );
  }

  if (ageDays < 3) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-blue-600">
        <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
        Recent
      </span>
    );
  }

  if (ageDays < 7) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
        <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
        This week
      </span>
    );
  }

  if (ageDays < 14) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
        <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
        2 weeks ago
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
      <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
      {Math.floor(ageDays)}d ago
    </span>
  );
}
