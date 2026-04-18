import Link from "next/link";
import { CATEGORIES_WITH_SUBS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="text-lg font-bold text-white">Zambia.net Marketplace</span>
            </div>
            <p className="text-sm">
              Your local marketplace. Buy, sell, and connect with your community.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Categories</h4>
            <ul className="space-y-2 text-sm">
              {CATEGORIES_WITH_SUBS.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/search?category=${cat.slug}`}
                    className="hover:text-white transition"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">For Sellers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/listings/new" className="hover:text-white transition">Post an Ad</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Seller Dashboard</Link></li>
              <li><Link href="/dashboard/referrals" className="hover:text-white transition">Invite & Earn</Link></li>
              <li><Link href="/developers" className="hover:text-white transition">Developer API</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-sm text-center">
          &copy; {new Date().getFullYear()} Zambia.net Marketplace. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
