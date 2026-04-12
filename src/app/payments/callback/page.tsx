"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found.");
      return;
    }

    verifyPayment(reference);
  }, [reference]);

  async function verifyPayment(ref: string) {
    try {
      const res = await fetch(`/api/payments/verify?reference=${encodeURIComponent(ref)}`);
      const data = await res.json();

      if (res.ok && data.status === "success") {
        setStatus("success");
        setMessage(data.message || "Payment verified successfully!");
      } else {
        setStatus("failed");
        setMessage(data.error || data.message || "Payment verification failed.");
      }
    } catch {
      setStatus("failed");
      setMessage("An error occurred while verifying the payment.");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow text-center">
      {status === "loading" && (
        <>
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-800">Verifying Payment</h1>
          <p className="text-gray-500 mt-2">Please wait...</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">&#10003;</span>
          </div>
          <h1 className="text-xl font-semibold text-green-800">Payment Successful</h1>
          <p className="text-gray-600 mt-2">{message}</p>
        </>
      )}

      {status === "failed" && (
        <>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">&#10007;</span>
          </div>
          <h1 className="text-xl font-semibold text-red-800">Payment Failed</h1>
          <p className="text-gray-600 mt-2">{message}</p>
        </>
      )}

      <Link
        href="/dashboard"
        className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
