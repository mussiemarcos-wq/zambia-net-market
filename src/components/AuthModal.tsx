"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { X, Eye, EyeOff } from "lucide-react";
import PhoneVerifyModal from "@/components/PhoneVerifyModal";

export default function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal, setUser, openAuthModal } =
    useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [verifyPhone, setVerifyPhone] = useState<string | null>(null);
  const [autoSentOtp, setAutoSentOtp] = useState(false);

  const [loginForm, setLoginForm] = useState({ phone: "+260", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    phone: "+260",
    password: "",
    email: "",
    location: "",
  });

  // Don't return null here - we need PhoneVerifyModal to keep rendering
  // even after the auth modal closes (e.g. after registration triggers OTP).

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Handle both {user: {...}} and direct user object shapes
      const u = data.user && typeof data.user === "object" ? data.user : data;
      setUser(u);
      // If user hasn't verified their phone yet, show the OTP modal
      if (u && u.isPhoneVerified === false) {
        setVerifyPhone(u.phone);
        setAutoSentOtp(false);
      } else {
        closeAuthModal();
      }
      setLoginForm({ phone: "", password: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Check for stored referral code
      const storedReferralCode = typeof window !== "undefined"
        ? localStorage.getItem("referralCode")
        : null;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...registerForm,
          email: registerForm.email || undefined,
          location: registerForm.location || undefined,
          referralCode: storedReferralCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Clear stored referral code after successful registration
      if (typeof window !== "undefined") {
        localStorage.removeItem("referralCode");
      }
      // Handle both {user: {...}} and direct user object shapes
      const u = data.user && typeof data.user === "object" ? data.user : data;
      setUser(u);
      // After registration, OTP was auto-sent. Show verification modal.
      setVerifyPhone(u.phone);
      setAutoSentOtp(true);
      setRegisterForm({ name: "", phone: "+260", password: "", email: "", location: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    {isAuthModalOpen && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => { openAuthModal("login"); setError(""); }}
              className={`text-sm font-medium pb-1 ${
                authModalTab === "login"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => { openAuthModal("register"); setError(""); }}
              className={`text-sm font-medium pb-1 ${
                authModalTab === "register"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              Register
            </button>
          </div>
          <button onClick={closeAuthModal} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          {authModalTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+260 9XX XXX XXX"
                  value={loginForm.phone}
                  onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+260 9XX XXX XXX"
                  value={registerForm.phone}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, password: e.target.value })
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location (optional)
                </label>
                <input
                  type="text"
                  placeholder="City or area"
                  value={registerForm.location}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
    )}

    {/* Phone verification modal - shown after registration or login if unverified */}
    <PhoneVerifyModal
      phone={verifyPhone || ""}
      isOpen={!!verifyPhone}
      autoSent={autoSentOtp}
      onClose={() => {
        setVerifyPhone(null);
        setAutoSentOtp(false);
      }}
      onVerified={async () => {
        // Refresh user data to pick up isPhoneVerified=true
        try {
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const data = await res.json();
            const u = data.user && typeof data.user === "object" ? data.user : data;
            setUser(u);
          }
        } catch {
          // ignore
        }
        setVerifyPhone(null);
        setAutoSentOtp(false);
        closeAuthModal();
      }}
    />
    </>
  );
}
