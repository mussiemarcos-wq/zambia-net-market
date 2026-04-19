"use client";

import { useEffect, useState } from "react";
import {
  Copy,
  Check,
  Gift,
  Users,
  Trophy,
  Star,
  Crown,
  BadgeCheck,
  Rocket,
  Share2,
} from "lucide-react";
import DashboardAuthPrompt from "@/components/DashboardAuthPrompt";

interface ReferredUser {
  name: string;
  createdAt: string;
}

interface ReferralData {
  referralCode: string;
  referralLink: string;
  referralCount: number;
  referredUsers: ReferredUser[];
}

const REWARD_TIERS = [
  {
    count: 3,
    label: "1 Free Listing Boost (7 days)",
    icon: Rocket,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    count: 5,
    label: "Verified Badge Free",
    icon: BadgeCheck,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    count: 10,
    label: "1 Month Basic Subscription Free",
    icon: Star,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    count: 25,
    label: "Community Champion Badge",
    icon: Crown,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
];

export default function ReferralDashboardPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/referrals");
        if (res.status === 401) {
          setNeedsAuth(true);
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setNeedsAuth(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function copyLink() {
    if (!data) return;
    await navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!data) return;
    const text = `Join Zambia.net Marketplace and buy or sell anything locally! Sign up using my link: ${data.referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function shareTelegram() {
    if (!data) return;
    const text = "Join Zambia.net Marketplace and buy or sell anything locally!";
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(data.referralLink)}&text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  function shareFacebook() {
    if (!data) return;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.referralLink)}`,
      "_blank"
    );
  }

  if (needsAuth) {
    return <DashboardAuthPrompt />;
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Determine next reward tier
  const nextTier = REWARD_TIERS.find((t) => t.count > data.referralCount);
  const progressPercent = nextTier
    ? Math.min((data.referralCount / nextTier.count) * 100, 100)
    : 100;
  const referralsToNext = nextTier
    ? nextTier.count - data.referralCount
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
          <Gift className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invite Friends</h1>
          <p className="text-sm text-gray-500">
            Share your referral link and earn rewards
          </p>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 md:p-8 text-white mb-6">
        <p className="text-blue-200 text-sm font-medium mb-2">Your Referral Code</p>
        <p className="text-3xl md:text-4xl font-bold tracking-widest mb-4">
          {data.referralCode}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-white/10 rounded-lg px-4 py-2.5 text-sm truncate">
            {data.referralLink}
          </div>
          <button
            onClick={copyLink}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition text-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={shareWhatsApp}
          className="flex items-center justify-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          WhatsApp
        </button>
        <button
          onClick={shareTelegram}
          className="flex items-center justify-center gap-2 p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          Telegram
        </button>
        <button
          onClick={shareFacebook}
          className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          Facebook
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Your Referrals</h2>
        </div>
        <div className="text-4xl font-bold text-blue-600 mb-1">
          {data.referralCount}
        </div>
        <p className="text-sm text-gray-500">
          {data.referralCount === 1 ? "friend" : "friends"} joined using your link
        </p>
      </div>

      {/* Progress to Next Reward */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            {nextTier ? "Next Reward" : "All Rewards Unlocked!"}
          </h2>
        </div>
        {nextTier ? (
          <>
            <p className="text-sm text-gray-600 mb-3">
              Invite {referralsToNext} more {referralsToNext === 1 ? "friend" : "friends"} to
              unlock: <span className="font-medium">{nextTier.label}</span>
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {data.referralCount} / {nextTier.count} referrals
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-600">
            Congratulations! You have unlocked all reward tiers. You are a true Community
            Champion!
          </p>
        )}
      </div>

      {/* Reward Tiers */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reward Tiers</h2>
        <div className="space-y-3">
          {REWARD_TIERS.map((tier) => {
            const unlocked = data.referralCount >= tier.count;
            return (
              <div
                key={tier.count}
                className={`flex items-center gap-4 p-4 rounded-xl border ${
                  unlocked
                    ? "border-green-200 bg-green-50"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    unlocked ? "bg-green-100" : tier.bg
                  }`}
                >
                  <tier.icon
                    className={`w-5 h-5 ${unlocked ? "text-green-600" : tier.color}`}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      unlocked ? "text-green-800" : "text-gray-900"
                    }`}
                  >
                    {tier.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {tier.count} referrals required
                  </p>
                </div>
                {unlocked && (
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Unlocked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Referred Users List */}
      {data.referredUsers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            People You Referred
          </h2>
          <div className="divide-y divide-gray-100">
            {data.referredUsers.map((person, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {person.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(person.createdAt).toLocaleDateString("en-ZM", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Message */}
      {data.referralCount < 5 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-sm text-amber-800 font-medium">
            Invite {5 - data.referralCount} more{" "}
            {5 - data.referralCount === 1 ? "friend" : "friends"} to get a free
            Verified Badge!
          </p>
        </div>
      )}
    </div>
  );
}
