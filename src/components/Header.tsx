"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Heart,
  User,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Shield,
  ChevronDown,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const { user, setUser, openAuthModal } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) {
          // Not authenticated - clear any stale state from the store
          setUser(null);
          return;
        }
        // Handle both { user: {...} } and direct user object shapes
        const u = data.user && typeof data.user === "object" ? data.user : data;
        if (u && u.id) {
          setUser(u);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, [setUser]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
    setUserMenuOpen(false);
    // Hard reload to ensure any server-rendered content is refreshed
    // with the logged-out state (removes name from header, etc.)
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 hidden sm:block">
              Zambia.net Marketplace
            </span>
          </Link>

          {/* Search bar - desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/listings/new"
                  className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Post Ad
                </Link>
                <Link
                  href="/favourites"
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <Heart className="w-5 h-5" />
                </Link>
                <NotificationBell />
                <ThemeToggle />
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                          {(user.name || "U").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col items-start leading-tight">
                      <span className="text-sm font-medium">
                        {(user.name || "User").split(" ")[0]}
                      </span>
                      {(user.role === "ADMIN" ||
                        user.role === "SUPER_ADMIN") && (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">
                          Admin
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 hidden lg:block text-gray-400" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.phone}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/favourites"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Heart className="w-4 h-4" />
                        Saved Listings
                      </Link>
                      {(user.role === "ADMIN" ||
                        user.role === "SUPER_ADMIN") && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <ThemeToggle />
                <button
                  onClick={() => openAuthModal("login")}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition"
                >
                  Log in
                </button>
                <button
                  onClick={() => openAuthModal("register")}
                  className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Post Ad
                </button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </form>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-4 py-3 space-y-2">
            {user ? (
              <>
                <div className="pb-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                    {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold uppercase px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</p>
                </div>
                <Link
                  href="/listings/new"
                  className="block py-2 text-blue-600 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Post Ad
                </Link>
                <Link
                  href="/dashboard"
                  className="block py-2 text-gray-700 dark:text-gray-300"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/favourites"
                  className="block py-2 text-gray-700 dark:text-gray-300"
                  onClick={() => setMenuOpen(false)}
                >
                  Saved Listings
                </Link>
                <div className="py-2">
                  <NotificationBell />
                </div>
                <div className="py-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <ThemeToggle />
                  <span className="text-sm">Theme</span>
                </div>
                {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                  <Link
                    href="/admin"
                    className="block py-2 text-gray-700 dark:text-gray-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="block py-2 text-red-600 w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="py-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <ThemeToggle />
                  <span className="text-sm">Theme</span>
                </div>
                <button
                  onClick={() => {
                    openAuthModal("login");
                    setMenuOpen(false);
                  }}
                  className="block py-2 text-gray-700 dark:text-gray-300 w-full text-left"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    openAuthModal("register");
                    setMenuOpen(false);
                  }}
                  className="block py-2 text-blue-600 font-medium w-full text-left"
                >
                  Post Ad
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
