"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Megaphone,
  Search,
  MessageCircle,
  Users,
  Rocket,
  PartyPopper,
} from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "onboarding-completed";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: <PartyPopper className="w-10 h-10 text-blue-600" />,
    title: "Welcome to Zambia.net Marketplace!",
    description:
      "Your local marketplace to buy, sell, and connect with your community. Post listings for property, vehicles, jobs, services, electronics, and more.",
  },
  {
    icon: <Megaphone className="w-10 h-10 text-blue-600" />,
    title: "Post Your First Ad",
    description:
      'Click the "+ Post Ad" button in the top navigation to create your first listing. Add photos, set your price, and describe what you\'re offering. It\'s free for your first 3 listings!',
  },
  {
    icon: <Search className="w-10 h-10 text-blue-600" />,
    title: "Find What You Need",
    description:
      "Use the search bar to find anything on the marketplace. Browse by category, filter by price, location, and condition to find exactly what you are looking for.",
  },
  {
    icon: <MessageCircle className="w-10 h-10 text-blue-600" />,
    title: "Contact Sellers Instantly",
    description:
      "Every listing includes WhatsApp and Telegram buttons so you can contact sellers directly. No middlemen, just quick and easy communication.",
  },
  {
    icon: <Users className="w-10 h-10 text-blue-600" />,
    title: "Invite Friends, Earn Rewards",
    description:
      "Share your referral link with friends. When they sign up and post their first listing, you both benefit from the referral rewards program.",
  },
  {
    icon: <Rocket className="w-10 h-10 text-blue-600" />,
    title: "You're All Set!",
    description:
      "You are ready to start using Zambia.net Marketplace. Post your first ad or browse listings to discover what is available in your area.",
  },
];

export default function OnboardingTour() {
  const { user } = useAppStore();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (user && !localStorage.getItem(STORAGE_KEY)) {
      setIsVisible(true);
    }
  }, [user]);

  function complete() {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  }

  if (!isVisible) return null;

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={complete}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            aria-label="Skip tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-4 text-center">
          <div className="flex items-center justify-center mb-5">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              {step.icon}
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {step.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Last step CTA buttons */}
        {isLast && (
          <div className="flex items-center justify-center gap-3 px-8 pb-4">
            <Link
              href="/listings/new"
              onClick={complete}
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Post an Ad
            </Link>
            <Link
              href="/search"
              onClick={complete}
              className="inline-flex items-center gap-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Browse Listings
            </Link>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 py-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentStep
                  ? "bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-8 pb-6">
          <button
            onClick={complete}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition px-3 py-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {!isLast && (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="inline-flex items-center gap-1 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
