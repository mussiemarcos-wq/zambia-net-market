"use client";

import { Zap, Clock } from "lucide-react";

interface ResponseRateProps {
  rate: string;
  label: string;
}

export default function ResponseRate({ rate, label }: ResponseRateProps) {
  if (!label || rate === "unknown") return null;

  const config: Record<string, { icon: React.ReactNode; color: string }> = {
    fast: {
      icon: <Zap className="w-3.5 h-3.5" />,
      color: "text-green-600",
    },
    moderate: {
      icon: <Clock className="w-3.5 h-3.5" />,
      color: "text-yellow-600",
    },
    slow: {
      icon: <Clock className="w-3.5 h-3.5" />,
      color: "text-gray-500",
    },
  };

  const { icon, color } = config[rate] || config.slow;

  return (
    <div className={`flex items-center gap-1.5 mt-2 ${color}`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
