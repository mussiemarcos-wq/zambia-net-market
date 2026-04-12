"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SUBSCRIPTION_PLANS, VERIFICATION_FEE } from "@/lib/constants";

interface BusinessProfile {
  id: string;
  businessName: string;
  description: string | null;
  website: string | null;
  operatingHours: Record<string, string> | null;
  subscriptionTier: string | null;
  subscriptionExpires: string | null;
}

interface User {
  id: string;
  name: string;
  role: string;
  isVerified: boolean;
}

export default function BusinessDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [operatingHours, setOperatingHours] = useState("");

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [userRes, profileRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/business-profile"),
      ]);

      if (!userRes.ok) {
        router.push("/auth/login");
        return;
      }

      const userData = await userRes.json();
      setUser(userData.user || userData);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const p = profileData.profile;
        if (p) {
          setProfile(p);
          setBusinessName(p.businessName);
          setDescription(p.description || "");
          setWebsite(p.website || "");
          setOperatingHours(
            p.operatingHours ? JSON.stringify(p.operatingHours, null, 2) : ""
          );
        }
      }

      // Check for pending verification
      const verUser = userData.user || userData;
      if (!verUser.isVerified) {
        // We don't have a dedicated endpoint to list requests,
        // but the verification request POST will tell us if one is pending
        setVerificationPending(false);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const isEdit = !!profile;
    const method = isEdit ? "PUT" : "POST";

    let parsedHours = null;
    if (operatingHours.trim()) {
      try {
        parsedHours = JSON.parse(operatingHours);
      } catch {
        setMessage({ type: "error", text: "Operating hours must be valid JSON" });
        setSaving(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/business-profile", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          description: description || undefined,
          website: website || undefined,
          operatingHours: parsedHours,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to save" });
      } else {
        setProfile(data.profile);
        setMessage({
          type: "success",
          text: isEdit ? "Profile updated!" : "Business profile created!",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleSubscribe(planId: string) {
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
        setMessage({ type: "error", text: data.error || "Failed to initialize payment" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  }

  async function handleVerify() {
    try {
      // First create the verification request
      const reqRes = await fetch("/api/verification/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const reqData = await reqRes.json();

      if (!reqRes.ok) {
        setMessage({ type: "error", text: reqData.error || "Failed to create verification request" });
        return;
      }

      setVerificationPending(true);

      // Then initialize payment for verification
      const payRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "VERIFICATION" }),
      });

      const payData = await payRes.json();

      if (payRes.ok && payData.authorizationUrl) {
        window.location.href = payData.authorizationUrl;
      } else {
        setMessage({
          type: "error",
          text: payData.error || "Failed to initialize verification payment",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold">Business Dashboard</h1>

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

      {/* Business Profile Form */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {profile ? "Edit Business Profile" : "Create Business Profile"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
              Business Name *
            </label>
            <input
              id="businessName"
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="operatingHours" className="block text-sm font-medium text-gray-700">
              Operating Hours (JSON)
            </label>
            <textarea
              id="operatingHours"
              rows={4}
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              placeholder='{"monday": "8:00 - 17:00", "saturday": "9:00 - 13:00"}'
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
          </button>
        </form>
      </section>

      {/* Subscription Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Subscription Plans</h2>
        <p className="text-gray-600 mb-4">
          Current plan:{" "}
          <span className="font-medium">
            {profile?.subscriptionTier
              ? SUBSCRIPTION_PLANS.find((p) => p.id === profile.subscriptionTier)?.name ||
                profile.subscriptionTier
              : "No subscription"}
          </span>
          {profile?.subscriptionExpires && (
            <span className="text-sm text-gray-500 ml-2">
              (expires {new Date(profile.subscriptionExpires).toLocaleDateString()})
            </span>
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg p-4 ${
                profile?.subscriptionTier === plan.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-2xl font-bold mt-1">K{plan.price}</p>
              <p className="text-sm text-gray-500 mb-3">per month</p>
              <ul className="space-y-1 mb-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm text-gray-600 flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={profile?.subscriptionTier === plan.id}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profile?.subscriptionTier === plan.id ? "Current Plan" : "Subscribe"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Verification Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Verification</h2>
        {user.isVerified ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              <span>&#10003;</span> Verified
            </span>
            <p className="text-gray-600 text-sm">Your account is verified.</p>
          </div>
        ) : verificationPending ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
              Verification pending
            </span>
            <p className="text-gray-600 text-sm">
              Your verification request is being reviewed.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-3">
              Get verified to build trust with buyers. Verification costs K{VERIFICATION_FEE.price}.
            </p>
            <button
              onClick={handleVerify}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Get Verified (K{VERIFICATION_FEE.price})
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
