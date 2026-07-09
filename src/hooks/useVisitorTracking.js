import { useEffect } from "react";
import { supabase } from "../lib/supabase";

// Dev-only logger — stripped to no-ops in production builds
const DEV = import.meta.env.DEV;
const log = DEV ? console.log.bind(console, "[Tracking]") : () => {};
const warn = DEV ? console.warn.bind(console, "[Tracking]") : () => {};
const err = DEV ? console.error.bind(console, "[Tracking]") : () => {};

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
    id = generateUUID();
  }
  return id;
}

/**
 * Returns the raw timestamp (ms) of the last tracked visit, or null.
 * Also doubles as the 24 h guard — callers check `lastTrackedMs !== null`.
 */
function getLastTrackedMs() {
  try {
    const raw = localStorage.getItem("portfolio_last_tracked_at");
    if (!raw) return null;
    const ts = parseInt(raw, 10);
    const elapsed = Date.now() - ts;
    // Only count as "within window" if less than 24 h
    return elapsed < 24 * 60 * 60 * 1000 ? ts : null;
  } catch {
    return null;
  }
}

/** Persist the current timestamp so the 24 h guard fires on the next visit */
function markTracked() {
  try {
    localStorage.setItem("portfolio_last_tracked_at", String(Date.now()));
  } catch {
    // Ignore storage errors
  }
}

// ── Main hook ──────────────────────────────────────────────────────────────

/**
 * useVisitorTracking — silently records unique visits and notifies on every
 * page load (new visitors counted + notified; returning visitors notified only,
 * never double-counted). No visible UI effect. Respects admin feature flags.
 */
export function useVisitorTracking() {
  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;

    async function track() {
      try {
        log("Starting visitor tracking flow...");

        // ── 1. Fetch feature-flag settings ────────────────────────────────
        const { data: settings, error: settingsError } = await supabase
          .from("visitor_settings")
          .select("key, value");

        if (settingsError) warn("Could not fetch settings:", settingsError.message);

        if (cancelled) return;

        const settingsMap = (settings || []).reduce((acc, row) => {
          acc[row.key] = row.value;
          return acc;
        }, {});

        log("Settings:", settingsMap);

        if (settingsMap.tracking_enabled === false) {
          log("Tracking disabled — skipping.");
          return;
        }

        // ── 2. Determine if this is a returning visitor ────────────────────
        // getLastTrackedMs() returns the previous timestamp if within 24 h,
        // or null if the visitor is new (or the window has expired).
        const lastTrackedMs = getLastTrackedMs();
        const isReturning = lastTrackedMs !== null;

        log(isReturning ? "Returning visitor (within 24 h window)." : "New visitor.");

        // ── 3. Collect visitor data ────────────────────────────────────────
        const ua = navigator.userAgent;
        const visitorId = getOrCreateVisitorId();
        const { browser, browser_version } = detectBrowser(ua);
        const os = detectOS(ua);
        const device_type = detectDevice(ua);
        const referrer = classifyReferrer(document.referrer);
        const page = window.location.pathname || "/";

        log("Collected data:", { visitorId, os, browser, browser_version, device_type, referrer, page });

        // ── 4. New visitor path: insert row + update count ─────────────────
        let totalCount = null;

        if (!isReturning) {
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
              // Server-side unique index caught a duplicate the client missed
              log("Server-side duplicate detected — marking locally and notifying as returning.");
              markTracked();
              // Fall through to notify as returning — the visitor WAS here before
            } else {
              warn("Insert failed:", insertError.message, insertError.code);
              return;
            }
          } else {
            log("Visitor row inserted successfully.");
            markTracked();

            // Fetch updated count (best-effort — must NOT block notification)
            try {
              const { data: countData, error: countError } = await supabase
                .from("visitor_count_cache")
                .select("total_count")
                .eq("id", 1)
                .single();

              if (countError) {
                warn("Count query error (non-fatal):", countError.message);
              } else {
                totalCount = countData?.total_count ?? null;
                log("Total visitor count:", totalCount);
              }
            } catch (countErr) {
              warn("Count query threw (non-fatal):", countErr);
            }
          }
        }

        // ── 5. Invoke Edge Function ────────────────────────────────────────
        // Always fires — for new visitors (after insert) and returning visitors.
        // Returning visitors are notified but never counted.
        if (settingsMap.notifications_enabled === false) {
          log("Telegram notifications disabled — skipping Edge Function call.");
          return;
        }

        log(
          isReturning
            ? "Invoking notify-visitor (returning visitor)..."
            : "Invoking notify-visitor (new visitor)...",
        );

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
              is_returning: isReturning,
              // ms elapsed since last visit — Edge Function formats this as "3h 17m ago"
              last_visit_ms: isReturning ? Date.now() - lastTrackedMs : null,
            },
          })
          .then(({ data: fnData, error: fnError }) => {
            if (fnError) warn("Edge Function returned error:", fnError);
            else log("Edge Function responded:", fnData);
          })
          .catch((invokeErr) => {
            warn("Edge Function invocation threw:", invokeErr);
          });

      } catch (unexpected) {
        err("Unexpected error in tracking flow:", unexpected);
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
