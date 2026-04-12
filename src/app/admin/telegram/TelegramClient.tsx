"use client";

import { useState } from "react";

export default function TelegramClient() {
  const [webhookStatus, setWebhookStatus] = useState<{
    url?: string;
    pending_update_count?: number;
    last_error_message?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupResult, setSetupResult] = useState<string | null>(null);
  const [channelPost, setChannelPost] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkStatus() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/telegram/setup");
      const data = await res.json();
      if (data.result) {
        setWebhookStatus(data.result);
      } else if (data.error) {
        setError(data.error);
      }
    } catch {
      setError("Failed to check webhook status");
    } finally {
      setLoading(false);
    }
  }

  async function setupWebhook() {
    setLoading(true);
    setError(null);
    setSetupResult(null);
    try {
      const res = await fetch("/api/telegram/setup", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSetupResult(data.message || "Webhook configured successfully");
        // Refresh status
        await checkStatus();
      }
    } catch {
      setError("Failed to setup webhook");
    } finally {
      setLoading(false);
    }
  }

  async function generateChannelPost() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/telegram/channel-post");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setChannelPost(data.post);
      }
    } catch {
      setError("Failed to generate channel post");
    } finally {
      setLoading(false);
    }
  }

  async function copyPost() {
    if (!channelPost) return;
    await navigator.clipboard.writeText(channelPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Telegram Bot Management
      </h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Manage your Zambia.net Marketplace Telegram bot integration.
      </p>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "0.75rem 1rem",
            borderRadius: 8,
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {setupResult && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "0.75rem 1rem",
            borderRadius: 8,
            marginBottom: "1rem",
          }}
        >
          {setupResult}
        </div>
      )}

      {/* Webhook Status */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
          Webhook Status
        </h2>

        {webhookStatus ? (
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>URL:</strong>{" "}
              <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>
                {webhookStatus.url || "Not set"}
              </code>
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Connected:</strong>{" "}
              <span style={{ color: webhookStatus.url ? "#16a34a" : "#dc2626" }}>
                {webhookStatus.url ? "Yes" : "No"}
              </span>
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Pending updates:</strong> {webhookStatus.pending_update_count ?? 0}
            </div>
            {webhookStatus.last_error_message && (
              <div style={{ color: "#dc2626" }}>
                <strong>Last error:</strong> {webhookStatus.last_error_message}
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            Click &quot;Check Status&quot; to see the current webhook configuration.
          </p>
        )}

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={checkStatus}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500,
            }}
          >
            {loading ? "Checking..." : "Check Status"}
          </button>
          <button
            onClick={setupWebhook}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 8,
              border: "none",
              background: "#0088cc",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500,
            }}
          >
            {loading ? "Setting up..." : "Setup Webhook"}
          </button>
        </div>
      </section>

      {/* Channel Post Generator */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
          Channel Post Generator
        </h2>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Generate a formatted post with the top hot listings of the week. Copy and post it
          to your Telegram channel.
        </p>

        <button
          onClick={generateChannelPost}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 8,
            border: "none",
            background: "#0088cc",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 500,
            marginBottom: "1rem",
          }}
        >
          {loading ? "Generating..." : "Generate Post"}
        </button>

        {channelPost && (
          <div>
            <div
              style={{
                position: "relative",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "1rem",
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              {channelPost}
            </div>
            <button
              onClick={copyPost}
              style={{
                marginTop: "0.75rem",
                padding: "0.5rem 1rem",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: copied ? "#dcfce7" : "white",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        )}
      </section>

      {/* BotFather Instructions */}
      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
          How to Create a Telegram Bot
        </h2>
        <ol
          style={{
            lineHeight: 1.8,
            paddingLeft: "1.25rem",
            color: "#374151",
          }}
        >
          <li>
            Open Telegram and search for{" "}
            <strong>@BotFather</strong>.
          </li>
          <li>
            Send <code>/newbot</code> and follow the prompts to choose a name and
            username for your bot.
          </li>
          <li>
            BotFather will give you an API token. Copy it.
          </li>
          <li>
            Add the token to your <code>.env</code> file as{" "}
            <code>TELEGRAM_BOT_TOKEN</code>.
          </li>
          <li>
            Restart your application, then click &quot;Setup Webhook&quot; above.
          </li>
          <li>
            Your bot is now live! Users can find it by searching the username you
            chose.
          </li>
        </ol>

        <div
          style={{
            marginTop: "1rem",
            background: "#f0f9ff",
            borderRadius: 8,
            padding: "0.75rem 1rem",
            fontSize: "0.9rem",
            color: "#1e40af",
          }}
        >
          <strong>Tip:</strong> To set up a Telegram channel, create a channel in
          Telegram, add your bot as an administrator, then use the Channel Post
          Generator above to create formatted posts.
        </div>
      </section>
    </div>
  );
}
