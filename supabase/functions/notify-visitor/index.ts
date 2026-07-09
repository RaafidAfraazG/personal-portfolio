import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  console.log("[notify-visitor] Request received:", req.method, req.url);

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
      console.warn("[notify-visitor] Failed to parse request body:", parseErr);
    }

    const {
      visitor_id,
      os,
      browser,
      browser_version,
      device_type,
      referrer,
      page,
      total_count,
    } = body as {
      visitor_id?: string;
      os?: string;
      browser?: string;
      browser_version?: string;
      device_type?: string;
      referrer?: string;
      page?: string;
      total_count?: number | null;
    };

    console.log("[notify-visitor] Payload:", {
      visitor_id: visitor_id ? visitor_id.slice(0, 8) + "..." : "none",
      os, browser, browser_version, device_type, referrer, page, total_count,
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

    if (settingsError) {
      console.warn("[notify-visitor] Settings query error (proceeding anyway):", settingsError.message);
    }

    const notificationsEnabled =
      settings?.find((s: { key: string; value: boolean }) => s.key === "notifications_enabled")?.value ?? true;

    console.log("[notify-visitor] notifications_enabled =", notificationsEnabled);

    if (!notificationsEnabled) {
      console.log("[notify-visitor] Notifications disabled — skipping Telegram send.");
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

    console.log("[notify-visitor] IP:", rawIp, "| private:", isPrivateIp);

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
          console.log("[notify-visitor] Geo response:", geo);
          if (geo.status === "success") {
            city = geo.city || "Unknown";
            state = geo.regionName || "Unknown";
            country = geo.country || "Unknown";
          }
        } else {
          console.warn("[notify-visitor] Geo API HTTP status:", geoRes.status);
        }
      } catch (geoErr) {
        console.warn("[notify-visitor] Geo lookup failed (non-fatal):", geoErr);
      }
    }

    console.log("[notify-visitor] Location:", { city, state, country });

    // ── 4. Format time in IST ──────────────────────────────────────────────
    const now = new Date();
    const istTime = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    // ── 5. Build Telegram message ──────────────────────────────────────────
    const message = [
      `🌐 *New Portfolio Visitor*`,
      ``,
      `🕐 *Time (IST):* ${istTime}`,
      `📍 *Location:* ${city}, ${state}, ${country}`,
      `💻 *OS:* ${os || "Unknown"}`,
      `🌏 *Browser:* ${browser || "Unknown"} ${browser_version || ""}`,
      `📱 *Device:* ${device_type || "Unknown"}`,
      `🔗 *Referrer:* ${referrer || "Direct"}`,
      `📄 *Page:* ${page || "/"}`,
      `🆔 *Visitor ID:* \`${(visitor_id || "").slice(0, 8)}...\``,
      `👥 *Total Visitors:* ${total_count ?? "—"}`,
    ].join("\n");

    // ── 6. Send Telegram notification ──────────────────────────────────────
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

    console.log("[notify-visitor] Bot token present:", Boolean(botToken));
    console.log("[notify-visitor] Chat ID present:", Boolean(chatId));

    if (!botToken || !chatId) {
      console.error("[notify-visitor] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set in Edge Function secrets.");
      return new Response(
        JSON.stringify({ ok: false, error: "Telegram credentials not configured in Edge Function secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("[notify-visitor] Sending Telegram message...");

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
    console.log("[notify-visitor] Telegram API response:", JSON.stringify(tgData));

    if (!tgData.ok) {
      console.error("[notify-visitor] Telegram rejected the message:", tgData.description);
      return new Response(
        JSON.stringify({ ok: false, error: tgData.description }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("[notify-visitor] Telegram message sent successfully!");

    return new Response(
      JSON.stringify({ ok: true, city, state, country }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (err) {
    console.error("[notify-visitor] Unhandled error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
