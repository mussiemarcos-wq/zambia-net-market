"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function ReferralCapture() {
  const searchParams = useSearchParams();
  const { openAuthModal, user } = useAppStore();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;

    // Store for later use when the user registers
    localStorage.setItem("referralCode", ref.toUpperCase());

    // If the visitor is not logged in, auto-open the registration modal so
    // they land directly on the sign-up flow instead of the home page.
    // We delay slightly so the Header has time to load the current user
    // state and avoid popping the modal for already-logged-in users.
    const timer = setTimeout(() => {
      const currentUser = useAppStore.getState().user;
      if (!currentUser) {
        openAuthModal("register");
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
