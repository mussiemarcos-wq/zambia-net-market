import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import InstallPrompt from "@/components/InstallPrompt";
import OnboardingTour from "@/components/OnboardingTour";
import VerifyPhoneBanner from "@/components/VerifyPhoneBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:7333"),
  title: "Zambia.net Marketplace - Your Local Marketplace",
  description:
    "Buy, sell, and connect with your community. Post listings for property, vehicles, jobs, services, electronics and more.",
  openGraph: {
    siteName: "Zambia.net Marketplace",
    type: "website",
    title: "Zambia.net Marketplace - Your Local Marketplace",
    description:
      "Buy, sell, and connect with your community. Post listings for property, vehicles, jobs, services, electronics and more.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50 dark:bg-gray-900 dark:text-gray-100`}>
        <Header />
        <VerifyPhoneBanner />
        <main className="flex-1">{children}</main>
        <Footer />
        <AuthModal />
        <InstallPrompt />
        <OnboardingTour />
        <Script src="/sw-register.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
