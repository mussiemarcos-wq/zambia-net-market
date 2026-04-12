import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="text-lg font-bold text-white">Zambia.net Market</span>
            </div>
            <p className="text-sm">
              Your local marketplace. Buy, sell, and connect with your community.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search?category=property" className="hover:text-white transition">Property</Link></li>
              <li><Link href="/search?category=vehicles" className="hover:text-white transition">Vehicles</Link></li>
              <li><Link href="/search?category=jobs" className="hover:text-white transition">Jobs</Link></li>
              <li><Link href="/search?category=services" className="hover:text-white transition">Services</Link></li>
              <li><Link href="/search?category=electronics" className="hover:text-white transition">Electronics</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">For Sellers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/listings/new" className="hover:text-white transition">Post an Ad</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Seller Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          &copy; {new Date().getFullYear()} Zambia.net Market. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
