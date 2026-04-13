"use client";

import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  _count?: { listings: number };
}

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/search?category=${cat.slug}`}
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition group"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-4xl group-hover:bg-blue-100 transition">
            {cat.icon || "📦"}
          </div>
          <span className="text-sm font-medium text-gray-700 text-center leading-tight">
            {cat.name}
          </span>
          {cat._count && (
            <span className="text-[10px] text-gray-400">
              {cat._count.listings} ads
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
