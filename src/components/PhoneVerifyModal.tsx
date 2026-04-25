"use client";

import { useEffect, useRef, useState } from "react";
import { X, MessageCircle, CheckCircle, Loader2 } from "lucide-react";

interface PhoneVerifyModalProps {
  phone: string;
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  autoSent?: boolean; // true if OTP was already sent (e.g. on registration)
}

const RESEND_COOLDOWN = 60; // seconds

export default function PhoneVerifyModal({
  phone,
  isOpen,
  onClose,
  onVerified,
  autoSent = false,
}: PhoneVerifyModalProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(autoSent ? "Code sent via WhatsApp" : "");
  const [resendIn, setResendIn] = useState(autoSent ? RESEND_COOLDOWN : 0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setCode(["", "", "", "", "", ""]);
      setError("");
      setVerified(false);
      // Auto-focus first box
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleDigitChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    setError("");

    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits filled
    if (digit && index === 5 && next.every((d) => d.length === 1)) {
      void verifyCode(next.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setCode(next);
    if (pasted.length === 6) {
      void verifyCode(pasted);
    } else {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  }

  async function sendCode() {
    setSending(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send code");
      } else {
        setInfo("Code sent via WhatsApp");
        setResendIn(RESEND_COOLDOWN);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function verifyCode(fullCode: string) {
    if (fullCode.length !== 6) return;
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid code");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setVerified(true);
        // Brief success animation, then close
        setTimeout(() => {
          onVerified();
        }, 1200);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  // Format phone for display: hide middle digits
  function maskedPhone(p: string): string {
    const clean = p.replace(/\D/g, "");
    if (clean.length < 6) return p;
    const last3 = clean.slice(-3);
    const first3 = clean.slice(0, clean.length - 3 - 4);
    return `+${first3} ••• ${last3}`;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-gray-100">
              Verify your phone
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            disabled={verifying}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {verified ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Phone Verified!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                You can now post listings and contact sellers.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                We sent a 6-digit verification code to:
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-5">
                {maskedPhone(phone)}{" "}
                <span className="text-xs font-normal text-gray-400">
                  (via WhatsApp)
                </span>
              </p>

              {/* OTP digit boxes */}
              <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={verifying}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50"
                  />
                ))}
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 text-center mb-2">
                  {error}
                </div>
              )}

              {info && !error && (
                <div className="text-sm text-green-600 dark:text-green-400 text-center mb-2">
                  ✓ {info}
                </div>
              )}

              {verifying && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </div>
              )}

              <button
                type="button"
                onClick={() => void verifyCode(code.join(""))}
                disabled={code.some((d) => !d) || verifying}
                className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify
              </button>

              <div className="text-center mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Didn&apos;t get the code?{" "}
                  {resendIn > 0 ? (
                    <span className="text-gray-400">Resend in {resendIn}s</span>
                  ) : (
                    <button
                      onClick={sendCode}
                      disabled={sending}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      {sending ? "Sending..." : "Resend code"}
                    </button>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Make sure you have WhatsApp installed on this number.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
