"use client";

import { LockKeyhole, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";

export default function DashboardAuthPrompt() {
  const { openAuthModal } = useAppStore();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <LockKeyhole className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Sign in required
        </h1>
        <p className="text-gray-500 mb-6">
          You need to be logged in to access your seller dashboard. Sign in or
          create a free account to continue.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => openAuthModal("login")}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            onClick={() => openAuthModal("register")}
            className="w-full inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            <UserPlus className="w-4 h-4" />
            Create an Account
          </button>
          <Link
            href="/"
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition mt-2"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
