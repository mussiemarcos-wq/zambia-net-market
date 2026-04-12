"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_ACCESS_PLANS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export default function ApiDashboardPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/api-keys")
      .then((res) => {
        if (res.status === 401) {
          router.push("/");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json?.apiKey) setApiKey(json.apiKey);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/api-keys", { method: "POST" });
      if (res.status === 401) {
        router.push("/");
        return;
      }
      const json = await res.json();
      if (json?.apiKey) {
        setApiKey(json.apiKey);
        setShowKey(true);
      }
    } catch {
      // handle silently
    } finally {
      setGenerating(false);
    }
  };

  const maskedKey = apiKey
    ? `${apiKey.slice(0, 8)}${"*".repeat(apiKey.length - 12)}${apiKey.slice(-4)}`
    : "";

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-900">API Access</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">API Access</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your API key and integrate our marketplace into your
          applications.
        </p>
      </div>

      {/* API Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
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
              <span className="text-sm font-normal text-gray-500">/month</span>
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
            <button className="mt-6 w-full py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
              Subscribe
            </button>
          </div>
        ))}
      </div>

      {/* API Key Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Your API Key
        </h2>
        {apiKey ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-sm text-gray-700">
                {showKey ? apiKey : maskedKey}
              </div>
              <button
                onClick={() => setShowKey(!showKey)}
                className="px-3 py-3 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {showKey ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={handleCopy}
                className="px-4 py-3 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Keep your API key secure. Do not share it publicly or commit it to
              version control.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No API key generated yet. Click below to create one.
          </p>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-4 px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {generating
            ? "Generating..."
            : apiKey
            ? "Regenerate Key"
            : "Generate API Key"}
        </button>
      </div>

      {/* Usage Stats */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Usage This Month
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500">API Calls</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500">Unique Endpoints</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">0%</p>
            <p className="text-sm text-gray-500">Error Rate</p>
          </div>
        </div>
      </div>

      {/* Link to docs */}
      <div className="text-center bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Need help integrating?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Check out our full API documentation with examples and guides.
        </p>
        <Link
          href="/developers"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
        >
          View API Documentation
        </Link>
      </div>
    </div>
  );
}
