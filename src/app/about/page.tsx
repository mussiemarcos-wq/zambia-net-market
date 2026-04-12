import { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Shield, Smartphone, Users, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: `About Us - ${APP_NAME}`,
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Connecting Zambia&apos;s Buyers and Sellers
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            {APP_NAME} is Zambia&apos;s trusted digital marketplace, making it simple for
            anyone to buy, sell, and discover goods and services across the nation.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              {APP_NAME} was born from the vibrant WhatsApp communities where Zambians
              were already buying and selling everything from phones to property. We saw
              thousands of people posting items across scattered groups with no way to
              search, no trust signals, and no organisation.
            </p>
            <p>
              We set out to build something better -- a dedicated platform designed for
              Zambian commerce. A place where a farmer in Mkushi can list produce just as
              easily as a car dealer in Lusaka. Where buyers can search, compare, and
              connect with sellers they can trust.
            </p>
            <p>
              Today, {APP_NAME} serves communities across all ten provinces of Zambia,
              from the Copperbelt to the Southern Province. We are proud to support local
              entrepreneurs, small businesses, and everyday Zambians in growing their
              livelihoods through digital commerce.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Growing Every Day
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <p className="text-4xl font-bold text-blue-600 mb-2">10,000+</p>
              <p className="text-gray-600">Active Listings</p>
            </div>
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <p className="text-4xl font-bold text-blue-600 mb-2">5,000+</p>
              <p className="text-gray-600">Registered Users</p>
            </div>
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <p className="text-4xl font-bold text-blue-600 mb-2">8</p>
              <p className="text-gray-600">Categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Trust</h3>
                <p className="text-gray-600 text-sm">
                  Verified sellers, honest listings, and transparent reviews. We build trust
                  into every interaction on the platform.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Simplicity</h3>
                <p className="text-gray-600 text-sm">
                  List in minutes, find what you need in seconds. We keep things straightforward
                  so anyone can use the platform with ease.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Community</h3>
                <p className="text-gray-600 text-sm">
                  Built by Zambians, for Zambians. We listen to our community and grow together,
                  empowering local entrepreneurs every step of the way.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Local-first</h3>
                <p className="text-gray-600 text-sm">
                  Prices in Kwacha, support in local languages, and features designed for the
                  Zambian market. We put local needs first.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            We are a passionate team of Zambian technologists, designers, and community builders
            working to transform how Zambians trade online. Our team is based in Lusaka and
            growing rapidly.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { role: "Founder & CEO" },
              { role: "CTO" },
              { role: "Head of Operations" },
              { role: "Community Manager" },
            ].map((member) => (
              <div key={member.role} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Join the Marketplace?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Whether you are looking to sell your products or find great deals, {APP_NAME} is the
            place for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/listings/new"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
            >
              Start Selling Today
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
