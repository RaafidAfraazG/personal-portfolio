import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Parse request body
    const body = await req.json().catch(() => ({}));
    const {
      visitor_id,
      os,
      browser,
      browser_version,
      device_type,
      referrer,
      page,
      total_count,
    } = body;

    // 2. Check notifications_enabled setting
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: settings } = await supabase
      .from("visitor_settings")
      .select("key, value")
      .in("key", ["notifications_enabled"]);

    const notificationsEnabled =
      settings?.find((s) => s.key === "notifications_enabled")?.value ?? true;

    if (!notificationsEnabled) {
      return new Response(
        JSON.stringify({ ok: true, skipped: "notifications disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Geo-locate via real visitor IP
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
          if (geo.status === "success") {
            city = geo.city || "Unknown";
            state = geo.regionName || "Unknown";
            country = geo.country || "Unknown";
          }
        }
      } catch {
        // Geo lookup failed — continue without location
      }
    }

    // 4. Format time in IST
    const now = new Date();
    const istTime = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    // 5. Build Telegram message
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

    // 6. Send Telegram notification
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!botToken || !chatId) {
      return new Response(
        JSON.stringify({ ok: false, error: "Telegram credentials not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

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

    if (!tgData.ok) {
      console.error("Telegram API error:", tgData);
      return new Response(
        JSON.stringify({ ok: false, error: tgData.description }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, city, state, country }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("notify-visitor error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
