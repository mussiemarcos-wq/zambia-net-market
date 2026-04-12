"use client";

import { useState } from "react";

interface CronJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  scheduleDescription: string;
  endpoint: string;
  method: "GET" | "POST";
  manual?: boolean;
}

const CRON_JOBS: CronJob[] = [
  {
    id: "expire-listings",
    name: "Expire Listings",
    description: "Marks active listings past their expiration date as expired.",
    schedule: "0 2 * * *",
    scheduleDescription: "Daily at 2:00 AM",
    endpoint: "/api/admin/expire-listings",
    method: "POST",
  },
  {
    id: "expire-boosts",
    name: "Expire Boosts",
    description:
      "Removes boost and feature flags from listings whose promotion period has ended.",
    schedule: "0 3 * * *",
    scheduleDescription: "Daily at 3:00 AM",
    endpoint: "/api/admin/expire-boosts",
    method: "POST",
  },
  {
    id: "cleanup-images",
    name: "Cleanup Images",
    description:
      "Deletes images from expired or removed listings older than 30 days.",
    schedule: "0 4 * * 0",
    scheduleDescription: "Weekly on Sunday at 4:00 AM",
    endpoint: "/api/admin/cleanup-images",
    method: "POST",
  },
  {
    id: "check-saved-searches",
    name: "Check Saved Searches",
    description:
      "Scans for new listings matching users' saved searches and sends notifications.",
    schedule: "0 8 * * *",
    scheduleDescription: "Daily at 8:00 AM",
    endpoint: "/api/saved-searches/check",
    method: "GET",
  },
  {
    id: "price-drop-check",
    name: "Price Drop Check",
    description:
      "Price drop notifications are triggered automatically when a listing price is updated. No cron job is needed.",
    schedule: "-",
    scheduleDescription: "On listing update (event-driven)",
    endpoint: "",
    method: "GET",
    manual: true,
  },
];

interface JobResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export default function CronClient() {
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, JobResult>>({});

  async function runJob(job: CronJob) {
    if (job.manual || !job.endpoint) return;

    setRunning((prev) => ({ ...prev, [job.id]: true }));
    setResults((prev) => {
      const next = { ...prev };
      delete next[job.id];
      return next;
    });

    try {
      const res = await fetch(job.endpoint, {
        method: job.method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      setResults((prev) => ({
        ...prev,
        [job.id]: {
          success: res.ok,
          data: res.ok ? data : undefined,
          error: res.ok ? undefined : data.error || `HTTP ${res.status}`,
        },
      }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [job.id]: {
          success: false,
          error: err instanceof Error ? err.message : "Network error",
        },
      }));
    } finally {
      setRunning((prev) => ({ ...prev, [job.id]: false }));
    }
  }

  return (
    <div className="space-y-4">
      {CRON_JOBS.map((job) => (
        <div
          key={job.id}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {job.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {job.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                  {job.schedule}
                </span>
                <span>{job.scheduleDescription}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              {job.manual ? (
                <span className="text-xs text-gray-400 dark:text-gray-500 italic px-3 py-2">
                  Event-driven
                </span>
              ) : (
                <button
                  onClick={() => runJob(job)}
                  disabled={running[job.id]}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
                >
                  {running[job.id] ? "Running..." : "Run Now"}
                </button>
              )}
            </div>
          </div>

          {results[job.id] && (
            <div
              className={`mt-3 p-3 rounded text-sm ${
                results[job.id].success
                  ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}
            >
              {results[job.id].success ? (
                <div>
                  <span className="font-medium">Success</span>
                  {results[job.id].data != null && (
                    <pre className="mt-1 text-xs overflow-x-auto">
                      {JSON.stringify(results[job.id].data as Record<string, unknown>, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <div>
                  <span className="font-medium">Error:</span>{" "}
                  {results[job.id].error}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-300">
        <h4 className="font-semibold mb-1">Vercel Cron Setup</h4>
        <p>
          Automated scheduling via <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1 rounded">vercel.json</code> requires the Vercel Pro plan.
          On free/hobby plans, use an external cron service (e.g., cron-job.org, EasyCron)
          to send requests to each endpoint with the <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1 rounded">x-cron-secret</code> header.
        </p>
      </div>
    </div>
  );
}
