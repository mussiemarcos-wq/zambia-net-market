"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import PhoneVerifyModal from "@/components/PhoneVerifyModal";

export default function VerifyPhoneBanner() {
  const { user, setUser } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [autoSent, setAutoSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Persist dismissal across page navigations within the session only
    if (typeof window !== "undefined") {
      setDismissed(sessionStorage.getItem("verifyBannerDismissed") === "true");
    }
  }, []);

  // Don't render if no user, already verified, or admin, or dismissed
  if (!user) return null;
  if (user.isPhoneVerified) return null;
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") return null;
  if (dismissed && !showModal) return null;

  async function handleVerifyClick() {
    setSending(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: user!.phone }),
      });
      // Even on rate-limit (recent OTP), still open the modal
      if (res.ok || res.status === 429) {
        setAutoSent(res.ok);
        setShowModal(true);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not send code. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function dismissBanner() {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("verifyBannerDismissed", "true");
    }
  }

  return (
    <>
      {!showModal && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-amber-200 dark:border-amber-800">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="flex-1 text-sm">
              <span className="font-semibold text-amber-900 dark:text-amber-100">
                Verify your phone number
              </span>
              <span className="text-amber-700 dark:text-amber-300 ml-2 hidden sm:inline">
                to post listings and contact sellers.
              </span>
            </div>
            <button
              onClick={handleVerifyClick}
              disabled={sending}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
            >
              {sending ? "Sending..." : "Verify Now"}
            </button>
            <button
              onClick={dismissBanner}
              className="p-1 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <PhoneVerifyModal
        phone={user.phone}
        isOpen={showModal}
        autoSent={autoSent}
        onClose={() => setShowModal(false)}
        onVerified={async () => {
          // Refresh user
          try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
              const data = await res.json();
              const u =
                data.user && typeof data.user === "object" ? data.user : data;
              setUser(u);
            }
          } catch {
            // ignore
          }
          setShowModal(false);
        }}
      />
    </>
  );
}
