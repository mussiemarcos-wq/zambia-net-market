"use client";

import { useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore } from "@/lib/theme";

const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const labels = {
  light: "Light mode",
  dark: "Dark mode",
  system: "System theme",
};

const cycle: Record<string, "light" | "dark" | "system"> = {
  light: "dark",
  dark: "system",
  system: "light",
};

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  // Ensure theme is applied on mount
  useEffect(() => {
    setTheme(theme);
  }, []);

  const Icon = icons[theme];

  return (
    <button
      onClick={() => setTheme(cycle[theme])}
      className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
      title={labels[theme]}
      aria-label={labels[theme]}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
