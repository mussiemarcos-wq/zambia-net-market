import Link from "next/link";
import { API_ACCESS_PLANS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "API Documentation - Zambia.net Marketplace",
};

export default function DevelopersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Zambia.net Marketplace API
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Access marketplace data programmatically. Search listings, browse
          categories, and integrate our marketplace into your applications.
        </p>
      </div>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Start</h2>
        <div className="bg-gray-900 rounded-xl p-6 text-sm">
          <p className="text-gray-400 mb-2"># Get your API key from the dashboard, then:</p>
          <pre className="text-green-400 whitespace-pre-wrap">
{`curl -H "x-api-key: YOUR_API_KEY" \\
  https://marketplace.zambia.net/api/v1/listings?limit=10`}
          </pre>
        </div>
      </section>

      {/* Authentication */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Authentication
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-700 mb-3">
            All API requests require an API key passed via the{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
              x-api-key
            </code>{" "}
            header.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono">
            <span className="text-purple-600">x-api-key</span>:{" "}
            <span className="text-green-600">zmkt_your_api_key_here</span>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Get your API key from the{" "}
            <Link
              href="/dashboard/api"
              className="text-blue-600 hover:underline"
            >
              API Dashboard
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Endpoints */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Endpoints</h2>

        {/* Listings endpoint */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
              GET
            </span>
            <code className="text-sm font-mono font-semibold text-gray-900">
              /api/v1/listings
            </code>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Search and browse active listings with filtering and pagination.
          </p>

          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Query Parameters
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 font-medium">Parameter</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b border-gray-50">
                  <td className="py-2 font-mono text-xs">category</td>
                  <td className="py-2">string</td>
                  <td className="py-2">Filter by category slug</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-2 font-mono text-xs">search</td>
                  <td className="py-2">string</td>
                  <td className="py-2">Search listings by title</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-2 font-mono text-xs">minPrice</td>
                  <td className="py-2">number</td>
                  <td className="py-2">Minimum price filter</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-2 font-mono text-xs">maxPrice</td>
                  <td className="py-2">number</td>
                  <td className="py-2">Maximum price filter</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-2 font-mono text-xs">limit</td>
                  <td className="py-2">number</td>
                  <td className="py-2">Results per page (max 50, default 20)</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-xs">offset</td>
                  <td className="py-2">number</td>
                  <td className="py-2">Pagination offset (default 0)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 className="text-sm font-semibold text-gray-800 mt-4 mb-2">
            Example Request
          </h4>
          <div className="bg-gray-900 rounded-lg p-4 text-sm">
            <pre className="text-green-400 whitespace-pre-wrap">
{`curl -H "x-api-key: YOUR_API_KEY" \\
  "https://marketplace.zambia.net/api/v1/listings?category=electronics&search=laptop&limit=10"`}
            </pre>
          </div>

          <h4 className="text-sm font-semibold text-gray-800 mt-4 mb-2">
            Example Response
          </h4>
          <div className="bg-gray-900 rounded-lg p-4 text-sm overflow-x-auto">
            <pre className="text-gray-300 whitespace-pre-wrap">
{`{
  "data": [
    {
      "id": "abc123",
      "title": "Dell Laptop 16GB RAM",
      "price": 8500,
      "priceType": "NEGOTIABLE",
      "location": "Lusaka",
      "condition": "USED",
      "viewsCount": 42,
      "createdAt": "2026-04-01T10:00:00Z",
      "category": { "name": "Electronics", "slug": "electronics" },
      "image": { "url": "...", "thumbnailUrl": "..." },
      "seller": { "name": "John", "isVerified": true }
    }
  ],
  "pagination": { "total": 145, "limit": 10, "offset": 0 }
}`}
            </pre>
          </div>
        </div>

        {/* Categories endpoint */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
              GET
            </span>
            <code className="text-sm font-mono font-semibold text-gray-900">
              /api/v1/categories
            </code>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Get all categories with subcategories and listing counts.
          </p>

          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Example Request
          </h4>
          <div className="bg-gray-900 rounded-lg p-4 text-sm">
            <pre className="text-green-400 whitespace-pre-wrap">
{`curl -H "x-api-key: YOUR_API_KEY" \\
  "https://marketplace.zambia.net/api/v1/categories"`}
            </pre>
          </div>

          <h4 className="text-sm font-semibold text-gray-800 mt-4 mb-2">
            Example Response
          </h4>
          <div className="bg-gray-900 rounded-lg p-4 text-sm overflow-x-auto">
            <pre className="text-gray-300 whitespace-pre-wrap">
{`{
  "data": [
    {
      "id": "cat123",
      "name": "Electronics",
      "slug": "electronics",
      "icon": "...",
      "listingCount": 234,
      "subcategories": [
        { "id": "sub1", "name": "Phones", "slug": "electronics-phones" }
      ]
    }
  ]
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Rate Limits</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-700 mb-3">
            API rate limits depend on your plan. Exceeding your rate limit will
            return a 429 status code.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 font-medium">Plan</th>
                  <th className="pb-2 font-medium">Calls/Month</th>
                  <th className="pb-2 font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {API_ACCESS_PLANS.map((plan) => (
                  <tr key={plan.id} className="border-b border-gray-50">
                    <td className="py-2 font-medium">{plan.name}</td>
                    <td className="py-2">{plan.features[0]}</td>
                    <td className="py-2">{formatPrice(plan.price)}/mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">API Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {API_ACCESS_PLANS.map((plan, index) => (
            <div
              key={plan.id}
              className={`border rounded-xl p-6 ${
                index === 1
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-gray-200 bg-white"
              }`}
            >
              {index === 1 && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-900 mt-2">
                {plan.name}
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatPrice(plan.price)}
                <span className="text-sm font-normal text-gray-500">
                  /month
                </span>
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <svg
                      className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/api"
                className="mt-6 block w-full py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-center"
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center bg-gray-50 border border-gray-200 rounded-xl p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Ready to integrate?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Get your API key from your dashboard and start building.
        </p>
        <Link
          href="/dashboard/api"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Get API Key
        </Link>
      </div>
    </div>
  );
}
