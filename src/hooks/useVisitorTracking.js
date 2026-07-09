import { useEffect } from "react";
import { supabase } from "../lib/supabase";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Generate a UUID v4 */
function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Classify referrer URL into a human-friendly label */
function classifyReferrer(referrerUrl) {
  if (!referrerUrl) return "Direct";
  try {
    const host = new URL(referrerUrl).hostname.toLowerCase();
    if (host.includes("linkedin.com")) return "LinkedIn";
    if (host.includes("google.com") || host.includes("google.co")) return "Google";
    if (host.includes("github.com") || host.includes("githubusercontent.com")) return "GitHub";
    if (host.includes("twitter.com") || host.includes("t.co") || host.includes("x.com")) return "Twitter / X";
    if (host.includes("facebook.com") || host.includes("fb.com")) return "Facebook";
    if (host.includes("instagram.com")) return "Instagram";
    if (host.includes("reddit.com")) return "Reddit";
    if (host.includes("duckduckgo.com")) return "DuckDuckGo";
    if (host.includes("bing.com")) return "Bing";
    if (host.includes("yahoo.com")) return "Yahoo";
    if (host.includes("medium.com")) return "Medium";
    if (host.includes("dev.to")) return "Dev.to";
    if (host.includes("whatsapp.com")) return "WhatsApp";
    if (host.includes("telegram.org")) return "Telegram";
    return host.replace(/^www\./, "");
  } catch {
    return "Unknown";
  }
}

/** Parse OS from userAgent */
function detectOS(ua) {
  if (/Windows NT 10/.test(ua)) return "Windows 10/11";
  if (/Windows NT 6\.3/.test(ua)) return "Windows 8.1";
  if (/Windows NT 6\.1/.test(ua)) return "Windows 7";
  if (/Windows/.test(ua)) return "Windows";
  if (/iPhone OS/.test(ua)) return "iOS";
  if (/iPad/.test(ua)) return "iPadOS";
  if (/Android/.test(ua)) return "Android";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  if (/CrOS/.test(ua)) return "ChromeOS";
  return "Unknown";
}

/** Parse browser name and version from userAgent */
function detectBrowser(ua) {
  // Order matters — check more specific patterns first
  const patterns = [
    { name: "Edge", re: /Edg(?:e|A|iOS)?\/(\d+)/ },
    { name: "Samsung Internet", re: /SamsungBrowser\/(\d+)/ },
    { name: "Opera", re: /OPR\/(\d+)/ },
    { name: "Opera Mini", re: /Opera Mini\/(\d+)/ },
    { name: "Firefox", re: /Firefox\/(\d+)/ },
    { name: "Chrome", re: /Chrome\/(\d+)/ },
    { name: "Safari", re: /Version\/(\d+).*Safari/ },
    { name: "IE", re: /Trident.*rv:(\d+)/ },
  ];

  for (const { name, re } of patterns) {
    const match = ua.match(re);
    if (match) return { browser: name, browser_version: match[1] };
  }
  return { browser: "Unknown", browser_version: "" };
}

/** Detect device type */
function detectDevice(ua) {
  if (/Tablet|iPad/i.test(ua)) return "Tablet";
  if (/Mobile|iPhone|Android(?!.*Tablet)|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return "Mobile";
  return "Desktop";
}

/** Get or create a persistent anonymous visitor ID */
function getOrCreateVisitorId() {
  const key = "portfolio_visitor_id";
  let id = null;
  try {
    id = localStorage.getItem(key);
    if (!id) {
      id = generateUUID();
      localStorage.setItem(key, id);
    }
  } catch {
    id = generateUUID(); // If localStorage is blocked, use ephemeral ID
  }
  return id;
}

/** Returns true if we already tracked this visitor within 24 hours (client-side guard) */
function isWithin24Hours() {
  try {
    const lastTracked = localStorage.getItem("portfolio_last_tracked_at");
    if (!lastTracked) return false;
    const elapsed = Date.now() - parseInt(lastTracked, 10);
    return elapsed < 24 * 60 * 60 * 1000; // 24 hours in ms
  } catch {
    return false;
  }
}

/** Mark the current time as the last tracked timestamp */
function markTracked() {
  try {
    localStorage.setItem("portfolio_last_tracked_at", String(Date.now()));
  } catch {
    // Ignore storage errors
  }
}

// ── Main hook ──────────────────────────────────────────────────────────────

/**
 * useVisitorTracking — silently records a unique visit on page load.
 * No visible UI effect. Respects admin feature flags.
 */
export function useVisitorTracking() {
  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;

    async function track() {
      try {
        // 1. Check tracking_enabled flag
        const { data: settings } = await supabase
          .from("visitor_settings")
          .select("key, value");

        if (cancelled) return;

        const settingsMap = (settings || []).reduce((acc, row) => {
          acc[row.key] = row.value;
          return acc;
        }, {});

        if (settingsMap.tracking_enabled === false) return;

        // 2. Client-side 24h dedup guard
        if (isWithin24Hours()) return;

        // 3. Collect visitor data
        const ua = navigator.userAgent;
        const visitorId = getOrCreateVisitorId();
        const { browser, browser_version } = detectBrowser(ua);
        const os = detectOS(ua);
        const device_type = detectDevice(ua);
        const referrer = classifyReferrer(document.referrer);
        const page = window.location.pathname || "/";

        // 4. Insert visitor row (server-side unique index handles server dedup)
        const { error: insertError } = await supabase.from("visitors").insert({
          visitor_id: visitorId,
          os,
          browser,
          browser_version,
          device_type,
          referrer,
          page,
        });

        if (cancelled) return;

        // If insert fails with unique violation (409/23505), visitor already counted today
        if (insertError) {
          // Mark locally to avoid future redundant calls this session
          if (insertError.code === "23505" || insertError.message?.includes("unique")) {
            markTracked();
          }
          return;
        }

        // 5. Mark as tracked to prevent re-runs in same session
        markTracked();

        // 6. Get updated total count for the notification
        const { data: countData } = await supabase
          .from("visitor_count_cache")
          .select("total_count")
          .eq("id", 1)
          .single();

        if (cancelled) return;

        const totalCount = countData?.total_count ?? null;

        // 7. Notify via Edge Function (fire-and-forget — don't block or show errors)
        if (settingsMap.notifications_enabled !== false) {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          fetch(`${supabaseUrl}/functions/v1/notify-visitor`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              visitor_id: visitorId,
              os,
              browser,
              browser_version,
              device_type,
              referrer,
              page,
              total_count: totalCount,
            }),
          }).catch(() => {}); // Silently ignore notification errors
        }
      } catch {
        // Never surface tracking errors to the user
      }
    }

    // Small delay so it doesn't compete with critical render work
    const timer = setTimeout(track, 1500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);
}
