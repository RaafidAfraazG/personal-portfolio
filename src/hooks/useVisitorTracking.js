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
        console.log("[Tracking] Starting visitor tracking flow...");

        // ── 1. Fetch feature-flag settings ────────────────────────────────
        const { data: settings, error: settingsError } = await supabase
          .from("visitor_settings")
          .select("key, value");

        if (settingsError) {
          console.warn("[Tracking] Could not fetch settings:", settingsError.message);
        }

        if (cancelled) return;

        const settingsMap = (settings || []).reduce((acc, row) => {
          acc[row.key] = row.value;
          return acc;
        }, {});

        console.log("[Tracking] Settings loaded:", settingsMap);

        if (settingsMap.tracking_enabled === false) {
          console.log("[Tracking] Tracking is disabled — skipping.");
          return;
        }

        // ── 2. Client-side 24 h dedup guard ───────────────────────────────
        if (isWithin24Hours()) {
          console.log("[Tracking] Within 24 h window — skipping.");
          return;
        }

        // ── 3. Collect visitor data ────────────────────────────────────────
        const ua = navigator.userAgent;
        const visitorId = getOrCreateVisitorId();
        const { browser, browser_version } = detectBrowser(ua);
        const os = detectOS(ua);
        const device_type = detectDevice(ua);
        const referrer = classifyReferrer(document.referrer);
        const page = window.location.pathname || "/";

        console.log("[Tracking] Collected data:", { visitorId, os, browser, browser_version, device_type, referrer, page });

        // ── 4. Insert visitor row ─────────────────────────────────────────
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

        if (insertError) {
          const isDuplicate =
            insertError.code === "23505" ||
            insertError.message?.toLowerCase().includes("unique");

          if (isDuplicate) {
            console.log("[Tracking] Duplicate visitor (unique index) — marking locally.");
            markTracked();
          } else {
            console.warn("[Tracking] Insert failed:", insertError.message, insertError.code);
          }
          return;
        }

        console.log("[Tracking] Visitor row inserted successfully.");

        // ── 5. Mark locally so this browser skips the next 24 h ───────────
        markTracked();

        // ── 6. Fetch total count (best-effort — MUST NOT block notification) ─
        let totalCount = null;
        try {
          const { data: countData, error: countError } = await supabase
            .from("visitor_count_cache")
            .select("total_count")
            .eq("id", 1)
            .single();

          if (countError) {
            console.warn("[Tracking] Count query error (non-fatal):", countError.message);
          } else {
            totalCount = countData?.total_count ?? null;
            console.log("[Tracking] Total visitor count:", totalCount);
          }
        } catch (countErr) {
          // Count query must never abort the notification path
          console.warn("[Tracking] Count query threw (non-fatal):", countErr);
        }

        // ── 7. Invoke Edge Function via supabase.functions.invoke() ─────────
        // Using invoke() instead of raw fetch() so the Supabase client
        // automatically attaches the correct Authorization: Bearer header.
        // A raw fetch() with only `apikey` is rejected by the gateway (401)
        // before the function code ever runs.
        if (settingsMap.notifications_enabled === false) {
          console.log("[Tracking] Telegram notifications disabled — skipping Edge Function call.");
          return;
        }

        console.log("[Tracking] Invoking notify-visitor Edge Function...");

        // NOTE: invoke() is intentionally NOT awaited so it is fire-and-forget.
        // We attach .then/.catch so we can still log the outcome.
        supabase.functions
          .invoke("notify-visitor", {
            body: {
              visitor_id: visitorId,
              os,
              browser,
              browser_version,
              device_type,
              referrer,
              page,
              total_count: totalCount,
            },
          })
          .then(({ data: fnData, error: fnError }) => {
            if (fnError) {
              console.warn("[Tracking] Edge Function returned error:", fnError);
            } else {
              console.log("[Tracking] Edge Function responded:", fnData);
            }
          })
          .catch((err) => {
            console.warn("[Tracking] Edge Function invocation threw:", err);
          });

      } catch (err) {
        // Log unexpected errors — do NOT surface them to the user
        console.error("[Tracking] Unexpected error in tracking flow:", err);
      }
    }

    // Small delay so tracking doesn't compete with critical first-render work
    const timer = setTimeout(track, 1500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);
}
