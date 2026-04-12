"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, MessageCircle } from "lucide-react";

interface DigestClientProps {
  initialMessage: string;
}

export default function DigestClient({ initialMessage }: DigestClientProps) {
  const [message, setMessage] = useState(initialMessage);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(new Date().toISOString());

  async function handleRegenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/digest");
      if (!res.ok) throw new Error("Failed to fetch digest");
      const data = await res.json();
      setMessage(data.message);
      setLastGenerated(data.generatedAt);
    } catch (err) {
      console.error("Failed to regenerate digest:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handleShareWhatsApp() {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Last generated:{" "}
          {new Date(lastGenerated).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        <button
          onClick={handleRegenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Regenerating..." : "Regenerate"}
        </button>
      </div>

      <div className="relative">
        <textarea
          readOnly
          value={message}
          className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy to Clipboard
            </>
          )}
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Share via WhatsApp
        </button>
      </div>
    </div>
  );
}
