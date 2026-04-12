"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { JOB_POSTING_PLANS } from "@/lib/constants";
import { formatPrice, timeAgo } from "@/lib/utils";
import {
  Briefcase,
  Eye,
  Users,
  TrendingUp,
  Plus,
  ExternalLink,
} from "lucide-react";

interface JobListing {
  id: string;
  title: string;
  status: string;
  viewsCount: number;
  applicationCount: number;
  createdAt: string;
  expiresAt: string | null;
  subcategory: string | null;
  price: string | null;
  location: string | null;
  image: string | null;
}

interface JobSummary {
  totalJobs: number;
  activeJobs: number;
  totalViews: number;
  totalApplications: number;
  avgApplicationsPerJob: number;
}

export default function JobsDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<JobListing[]>([]);
  const [summary, setSummary] = useState<JobSummary | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/auth/login");
        return;
      }

      const res = await fetch("/api/jobs/applications");
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
        setSummary(data.summary || null);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load job data" });
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(planId: string) {
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "SUBSCRIPTION", planId }),
      });

      const data = await res.json();

      if (res.ok && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to initialize payment",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  }

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      EXPIRED: "bg-gray-100 text-gray-600",
      DRAFT: "bg-yellow-100 text-yellow-800",
      SOLD: "bg-blue-100 text-blue-800",
      REMOVED: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || "bg-gray-100 text-gray-600"}`}
      >
        {status}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Post jobs, track applicants, and manage your recruitment.
          </p>
        </div>
        <Link
          href="/listings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Post a Job
        </Link>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Job Posting Plans */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Job Posting Packages</h2>
        <p className="text-gray-600 text-sm mb-4">
          Choose a plan that fits your hiring needs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {JOB_POSTING_PLANS.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative border rounded-lg p-5 ${
                index === 2
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-gray-200"
              }`}
            >
              {index === 2 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-0.5 rounded-full">
                  Best Value
                </span>
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {plan.name}
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatPrice(plan.price)}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {plan.id === "job_unlimited" ? "per month" : "one-time"}
              </p>
              <ul className="space-y-2 mb-5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span className="text-green-500 mt-0.5 flex-shrink-0">
                      &#10003;
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePurchase(plan.id)}
                className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                  index === 2
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                Purchase
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Summary Stats */}
      {summary && summary.totalJobs > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalJobs}
                </p>
                <p className="text-xs text-gray-500">Total Jobs</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.activeJobs}
                </p>
                <p className="text-xs text-gray-500">Active Jobs</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalViews}
                </p>
                <p className="text-xs text-gray-500">Total Views</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalApplications}
                </p>
                <p className="text-xs text-gray-500">Total Applications</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Your Job Listings */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Job Listings</h2>
          {listings.length > 0 && (
            <span className="text-sm text-gray-500">
              {listings.length} job{listings.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">
              You haven&apos;t posted any jobs yet.
            </p>
            <Link
              href="/listings/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-600">
                    Job Title
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-gray-600">
                    Views
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-gray-600">
                    Applications
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-gray-600">
                    Posted
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {listings.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium text-gray-900">{job.title}</p>
                        {job.subcategory && (
                          <p className="text-xs text-gray-500">
                            {job.subcategory}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">{statusBadge(job.status)}</td>
                    <td className="py-3 px-2 text-right text-gray-700">
                      {job.viewsCount}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="font-semibold text-blue-600">
                        {job.applicationCount}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-gray-500">
                      {timeAgo(job.createdAt)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Link
                        href={`/listings/${job.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Applicant Tracking */}
      {listings.length > 0 && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Applicant Tracking</h2>
          <p className="text-sm text-gray-500 mb-4">
            Jobs ranked by number of applications received.{" "}
            {summary && (
              <span className="font-medium text-gray-700">
                Average: {summary.avgApplicationsPerJob} applications per job
              </span>
            )}
          </p>

          <div className="space-y-3">
            {listings.map((job, index) => {
              const maxApps = listings[0]?.applicationCount || 1;
              const barWidth =
                maxApps > 0
                  ? Math.max((job.applicationCount / maxApps) * 100, 2)
                  : 2;
              return (
                <div key={job.id} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-400 w-6 text-right">
                    {index + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {job.title}
                      </p>
                      <span className="text-sm font-semibold text-blue-600 ml-3 flex-shrink-0">
                        {job.applicationCount} app
                        {job.applicationCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
