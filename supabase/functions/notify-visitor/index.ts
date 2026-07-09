import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Dev-only logger — Supabase automatically sets DENO_ENV=production on deployed functions.
// In local `supabase functions serve`, DENO_ENV is unset, so logs appear during development.
const DEV = Deno.env.get("DENO_ENV") !== "production";
const log = DEV ? (...a: unknown[]) => console.log("[notify-visitor]", ...a) : () => {};
const warn = DEV ? (...a: unknown[]) => console.warn("[notify-visitor]", ...a) : () => {};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Format an elapsed millisecond count into a human-readable string.
 * Examples: "45m ago", "3h 17m ago", "2d 5h ago"
 */
function formatTimeSince(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const days = Math.floor(totalSeconds / 86400);

  if (days > 0) return `${days}d ${hours}h ago`;
  if (hours > 0) return `${hours}h ${minutes}m ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

Deno.serve(async (req: Request) => {
  log("Request received:", req.method);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── 1. Parse request body ──────────────────────────────────────────────
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch (parseErr) {
      warn("Failed to parse request body:", parseErr);
    }

    const {
      visitor_id,
      os,
      browser,
      browser_version,
      device_type,
      referrer,
      page,
      unique_visitors,
      total_visits,
      is_returning,
      last_visit_ms,
    } = body as {
      visitor_id?: string;
      os?: string;
      browser?: string;
      browser_version?: string;
      device_type?: string;
      referrer?: string;
      page?: string;
      unique_visitors?: number | null;
      total_visits?: number | null;
      is_returning?: boolean;
      last_visit_ms?: number | null;
    };

    log("Payload:", {
      visitor_id: visitor_id ? visitor_id.slice(0, 8) + "..." : "none",
      is_returning, last_visit_ms,
      os, browser, browser_version, device_type, referrer, page,
      unique_visitors, total_visits,
    });

    // ── 2. Check notifications_enabled setting ─────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[notify-visitor] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ ok: false, error: "Supabase env vars not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: settings, error: settingsError } = await supabase
      .from("visitor_settings")
      .select("key, value")
      .in("key", ["notifications_enabled"]);

    if (settingsError) warn("Settings query error (proceeding anyway):", settingsError.message);

    const notificationsEnabled =
      settings?.find((s: { key: string; value: boolean }) => s.key === "notifications_enabled")?.value ?? true;

    log("notifications_enabled =", notificationsEnabled);

    if (!notificationsEnabled) {
      log("Notifications disabled — skipping Telegram send.");
      return new Response(
        JSON.stringify({ ok: true, skipped: "notifications disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── 3. Geo-locate via real visitor IP ──────────────────────────────────
    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const isPrivateIp =
      rawIp === "unknown" ||
      rawIp.startsWith("127.") ||
      rawIp.startsWith("10.") ||
      rawIp.startsWith("192.168.") ||
      rawIp.startsWith("::1") ||
      rawIp === "localhost";

    log("IP:", rawIp, "| private:", isPrivateIp);

    let city = "Unknown";
    let state = "Unknown";
    let country = "Unknown";

    if (!isPrivateIp) {
      try {
        const geoRes = await fetch(
          `http://ip-api.com/json/${rawIp}?fields=status,city,regionName,country`,
          { signal: AbortSignal.timeout(3000) },
        );
        if (geoRes.ok) {
          const geo = await geoRes.json();
          log("Geo response:", geo);
          if (geo.status === "success") {
            city = geo.city || "Unknown";
            state = geo.regionName || "Unknown";
            country = geo.country || "Unknown";
          }
        } else {
          warn("Geo API HTTP status:", geoRes.status);
        }
      } catch (geoErr) {
        warn("Geo lookup failed (non-fatal):", geoErr);
      }
    }

    log("Location:", { city, state, country });

    // ── 4. Format time in IST ──────────────────────────────────────────────
    const now = new Date();
    const istTime = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    // ── 5. Build Telegram message ──────────────────────────────────────────
    const locationLine = [city, state, country].filter((v) => v && v !== "Unknown").join(", ") || "Unknown";
    const browserLine = [browser, browser_version].filter(Boolean).join(" ") || "Unknown";
    const shortId = (visitor_id || "").slice(0, 8);

    let message: string;

    if (is_returning) {
      // ── Returning visitor ─────────────────────────────────────────────────
      const timeSince =
        typeof last_visit_ms === "number" && last_visit_ms > 0
          ? formatTimeSince(last_visit_ms)
          : "unknown";

      message = [
        `🔄 *Returning Portfolio Visitor*`,
        ``,
        `⏱ *Last Visit:* ${timeSince}`,
        ``,
        `🕒 *Time:* ${istTime} (IST)`,
        `🌍 *Location:* ${locationLine}`,
        `💻 *OS:* ${os || "Unknown"}`,
        `🌐 *Browser:* ${browserLine}`,
        `📱 *Device:* ${device_type || "Unknown"}`,
        `🔗 *Referrer:* ${referrer || "Direct"}`,
        `📄 *Page:* ${page || "/"}`,
        ``,
        `👤 *Visitor ID:* \`${shortId}...\``,
        `👥 *Unique Visitors:* ${unique_visitors ?? "—"}`,
        `👁 *Total Visits:* ${total_visits ?? "—"}`,
      ].join("\n");
    } else {
      // ── New visitor ───────────────────────────────────────────────────────
      message = [
        `🆕 *New Portfolio Visitor*`,
        ``,
        `🕒 *Time:* ${istTime} (IST)`,
        `🌍 *Location:* ${locationLine}`,
        `💻 *OS:* ${os || "Unknown"}`,
        `🌐 *Browser:* ${browserLine}`,
        `📱 *Device:* ${device_type || "Unknown"}`,
        `🔗 *Referrer:* ${referrer || "Direct"}`,
        `📄 *Page:* ${page || "/"}`,
        ``,
        `👤 *Visitor ID:* \`${shortId}...\``,
        `👥 *Unique Visitors:* ${unique_visitors ?? "—"}`,
        `👁 *Total Visits:* ${total_visits ?? "—"}`,
      ].join("\n");
    }

    // ── 6. Send Telegram notification ──────────────────────────────────────
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!botToken || !chatId) {
      console.error("[notify-visitor] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set in Edge Function secrets.");
      return new Response(
        JSON.stringify({ ok: false, error: "Telegram credentials not configured in Edge Function secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    log("Sending Telegram message (is_returning =", is_returning, ")...");

    const tgRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      },
    );

    const tgData = await tgRes.json();
    log("Telegram API response:", JSON.stringify(tgData));

    if (!tgData.ok) {
      console.error("[notify-visitor] Telegram rejected the message:", tgData.description);
      return new Response(
        JSON.stringify({ ok: false, error: tgData.description }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    log("Telegram message sent successfully!");

    return new Response(
      JSON.stringify({ ok: true, is_returning, city, state, country }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (error) {
    console.error("[notify-visitor] Unhandled error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
