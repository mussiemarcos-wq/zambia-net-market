"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone, ExternalLink } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently (show again after 3 days)
    const dismissedAt = localStorage.getItem("pwa-install-dismissed-at");
    if (dismissedAt) {
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissedAt) < threeDays) return;
    }

    // Detect iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // On iOS, show manual install instructions
    if (isIOSDevice) {
      setShow(true);
      return;
    }

    // On Android/Desktop, listen for beforeinstallprompt
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstall as EventListener
    );

    // Also show a generic banner after 5 seconds if no prompt fires
    // (for browsers that support PWA but haven't fired the event yet)
    const timer = setTimeout(() => {
      if (!deferredPrompt) {
        setShow(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstall as EventListener
      );
      clearTimeout(timer);
    };
  }, [deferredPrompt]);

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback: show instructions
      setShowIOSGuide(true);
    }
  }

  function handleDismiss() {
    setShow(false);
    setShowIOSGuide(false);
    localStorage.setItem("pwa-install-dismissed-at", Date.now().toString());
  }

  // Don't show if already installed
  if (isInstalled) return null;
  if (!show) return null;

  return (
    <>
      {/* Install banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm">
                Zambia.net Marketplace
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Install the app for faster access, notifications, and offline
                browsing
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-gray-600 transition flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              <Download className="w-4 h-4" />
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
            >
              Not now
            </button>
          </div>
        </div>
      </div>

      {/* iOS install guide modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Install the App</h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  To install Zambia.net Marketplace on your iPhone:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-600">
                      1
                    </div>
                    <p className="text-sm text-gray-700">
                      Tap the <ExternalLink className="w-4 h-4 inline" />{" "}
                      <strong>Share</strong> button at the bottom of Safari
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-600">
                      2
                    </div>
                    <p className="text-sm text-gray-700">
                      Scroll down and tap{" "}
                      <strong>&quot;Add to Home Screen&quot;</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-600">
                      3
                    </div>
                    <p className="text-sm text-gray-700">
                      Tap <strong>&quot;Add&quot;</strong> to install
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  To install Zambia.net Marketplace:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-600">
                      1
                    </div>
                    <p className="text-sm text-gray-700">
                      Tap the <Smartphone className="w-4 h-4 inline" />{" "}
                      <strong>menu</strong> (three dots) in your browser
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-600">
                      2
                    </div>
                    <p className="text-sm text-gray-700">
                      Tap <strong>&quot;Install app&quot;</strong> or{" "}
                      <strong>&quot;Add to Home Screen&quot;</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full mt-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
