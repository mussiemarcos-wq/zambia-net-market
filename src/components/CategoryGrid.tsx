"use client";

import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  _count?: { listings: number };
}

// Gradient palette per category slug
const GRADIENTS: Record<string, string> = {
  property: "from-blue-500 to-indigo-600",
  vehicles: "from-orange-500 to-red-600",
  jobs: "from-indigo-500 to-purple-600",
  services: "from-teal-500 to-cyan-600",
  "building-materials": "from-amber-500 to-orange-600",
  electronics: "from-sky-500 to-blue-600",
  furniture: "from-rose-500 to-pink-600",
  fashion: "from-pink-500 to-fuchsia-600",
  miscellaneous: "from-slate-500 to-gray-600",
};

const DEFAULT_GRADIENT = "from-gray-500 to-gray-600";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
      {categories.map((cat) => {
        const gradient = GRADIENTS[cat.slug] || DEFAULT_GRADIENT;
        const count = cat._count?.listings ?? 0;
        return (
          <Link
            key={cat.id}
            href={`/search?category=${cat.slug}`}
            className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center hover:shadow-lg hover:-translate-y-0.5 hover:border-transparent transition-all duration-200 overflow-hidden"
          >
            {/* Gradient background on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity`}
            />

            <div className="relative">
              <div
                className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all`}
              >
                <span className="drop-shadow-sm">{cat.icon || "📦"}</span>
              </div>
              <span className="block text-xs font-semibold text-gray-700 dark:text-gray-200 leading-tight">
                {cat.name}
              </span>
              {count > 0 && (
                <span className="block text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                  {count} {count === 1 ? "ad" : "ads"}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
