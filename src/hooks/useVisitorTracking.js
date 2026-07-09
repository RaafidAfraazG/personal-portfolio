import { useEffect } from "react";
import { supabase } from "../lib/supabase";

// Dev-only logger — no-ops in production builds (import.meta.env.DEV = false)
const DEV = import.meta.env.DEV;
const log = DEV ? console.log.bind(console, "[Tracking]") : () => {};
const warn = DEV ? console.warn.bind(console, "[Tracking]") : () => {};
const err = DEV ? console.error.bind(console, "[Tracking]") : () => {};

// ── Constants ─────────────────────────────────────────────────────────────

// 30-minute anti-spam window for total_visits.
// Prevents a rapid-refresh from inflating the visit counter.
const VISIT_SPAM_WINDOW_MS = 30 * 60 * 1000;

// ── Helpers ────────────────────────────────────────────────────────────────

function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

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

function detectBrowser(ua) {
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

function detectDevice(ua) {
  if (/Tablet|iPad/i.test(ua)) return "Tablet";
  if (/Mobile|iPhone|Android(?!.*Tablet)|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return "Mobile";
  return "Desktop";
}

function getOrCreateVisitorId() {
  const key = "portfolio_visitor_id";
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = generateUUID();
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return generateUUID();
  }
}

/**
 * Returns the raw ms timestamp of the last unique-visitor record, or null if
 * the 24 h dedup window has expired / no record exists.
 * "Returning" = same browser, same day (< 24 h since last tracked).
 */
function getLastTrackedMs() {
  try {
    const raw = localStorage.getItem("portfolio_last_tracked_at");
    if (!raw) return null;
    const ts = parseInt(raw, 10);
    return Date.now() - ts < 24 * 60 * 60 * 1000 ? ts : null;
  } catch {
    return null;
  }
}

/** Persist current timestamp — marks the unique-visitor 24 h window. */
function markTracked() {
  try {
    localStorage.setItem("portfolio_last_tracked_at", String(Date.now()));
  } catch { /* ignore */ }
}

/**
 * Returns true if the VISIT spam window (30 min) has not yet elapsed.
 * Used to prevent rapid refresh from inflating total_visits.
 */
function isWithinVisitSpamWindow() {
  try {
    const raw = localStorage.getItem("portfolio_last_visit_at");
    if (!raw) return false;
    return Date.now() - parseInt(raw, 10) < VISIT_SPAM_WINDOW_MS;
  } catch {
    return false;
  }
}

/** Persist current timestamp — marks the 30 min visit spam window. */
function markVisited() {
  try {
    localStorage.setItem("portfolio_last_visit_at", String(Date.now()));
  } catch { /* ignore */ }
}

// ── Main hook ──────────────────────────────────────────────────────────────

/**
 * useVisitorTracking
 *
 * Metrics updated per visit type:
 *
 * | Visit type         | visitors row | unique_visitors | total_visits | Telegram |
 * |--------------------|:------------:|:---------------:|:------------:|:--------:|
 * | New (first time)   |      ✓       |        ✓        |      ✓       |    🆕    |
 * | Returning (< 24 h) |      ✗       |        ✗        |      ✓ *     |    🔄    |
 * | Rapid refresh      |      ✗       |        ✗        |      ✗       |    ✗     |
 *
 * * total_visits is incremented via the increment_total_visits() RPC —
 *   no direct table write, no RLS required, security definer function.
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

        // ── 2. Classify visit type ────────────────────────────────────────
        const lastTrackedMs = getLastTrackedMs(); // null = new visitor
        const isReturning = lastTrackedMs !== null;

        log(isReturning ? "Returning visitor (within 24 h)." : "New visitor.");

        // ── 3. Anti-spam guard for total_visits ───────────────────────────
        // For returning visitors: skip everything if we've already counted
        // a visit within the 30-minute spam window.
        if (isReturning && isWithinVisitSpamWindow()) {
          log("Within 30-min visit spam window — skipping entirely.");
          return;
        }

        // ── 4. Collect visitor data ───────────────────────────────────────
        const ua = navigator.userAgent;
        const visitorId = getOrCreateVisitorId();
        const { browser, browser_version } = detectBrowser(ua);
        const os = detectOS(ua);
        const device_type = detectDevice(ua);
        const referrer = classifyReferrer(document.referrer);
        const page = window.location.pathname || "/";

        log("Collected data:", { visitorId, os, browser, browser_version, device_type, referrer, page });

        // ── 5. New visitor: insert row (trigger handles unique_visitors + total_visits)
        let uniqueVisitors = null;
        let totalVisits = null;

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
              // Server-side unique index caught what the client missed.
              // Treat as returning: mark locally so we get the 24 h guard next time.
              log("Server-side duplicate — treating as returning visitor.");
              markTracked();
              // Fall through to returning-visitor path below
            } else {
              warn("Insert failed:", insertError.message, insertError.code);
              return;
            }
          } else {
            log("Visitor row inserted. Trigger will update unique_visitors + total_visits.");
            markTracked();
            markVisited();

            // Fetch counts after insert (best-effort; must NOT block notification)
            try {
              const { data: countData, error: countError } = await supabase
                .from("visitor_count_cache")
                .select("unique_visitors, total_visits")
                .eq("id", 1)
                .single();

              if (countError) {
                warn("Count query error (non-fatal):", countError.message);
              } else {
                uniqueVisitors = countData?.unique_visitors ?? null;
                totalVisits = countData?.total_visits ?? null;
                log("Counts after insert — unique:", uniqueVisitors, "| total visits:", totalVisits);
              }
            } catch (countErr) {
              warn("Count query threw (non-fatal):", countErr);
            }

            // Invoke Edge Function for new visitor then return
            if (settingsMap.notifications_enabled !== false) {
              log("Invoking notify-visitor (new visitor)...");
              supabase.functions
                .invoke("notify-visitor", {
                  body: {
                    visitor_id: visitorId,
                    os, browser, browser_version, device_type, referrer, page,
                    unique_visitors: uniqueVisitors,
                    total_visits: totalVisits,
                    is_returning: false,
                    last_visit_ms: null,
                  },
                })
                .then(({ data: fnData, error: fnError }) => {
                  if (fnError) warn("Edge Function error (new):", fnError);
                  else log("Edge Function responded:", fnData);
                })
                .catch((e) => warn("Edge Function threw (new):", e));
            }
            return;
          }
        }

        // ── 6. Returning visitor: increment total_visits via RPC ──────────
        // The visitors table is NOT touched — unique_visitors stays unchanged.
        log("Incrementing total_visits via RPC (returning visitor)...");
        const { error: rpcError } = await supabase.rpc("increment_total_visits");
        if (rpcError) warn("increment_total_visits RPC error (non-fatal):", rpcError.message);

        markVisited();

        // Fetch updated counts (best-effort)
        try {
          const { data: countData, error: countError } = await supabase
            .from("visitor_count_cache")
            .select("unique_visitors, total_visits")
            .eq("id", 1)
            .single();

          if (countError) {
            warn("Count query error (non-fatal):", countError.message);
          } else {
            uniqueVisitors = countData?.unique_visitors ?? null;
            totalVisits = countData?.total_visits ?? null;
            log("Counts after return — unique:", uniqueVisitors, "| total visits:", totalVisits);
          }
        } catch (countErr) {
          warn("Count query threw (non-fatal):", countErr);
        }

        // ── 7. Invoke Edge Function for returning visitor ─────────────────
        if (settingsMap.notifications_enabled === false) {
          log("Telegram notifications disabled — skipping.");
          return;
        }

        log("Invoking notify-visitor (returning visitor)...");
        supabase.functions
          .invoke("notify-visitor", {
            body: {
              visitor_id: visitorId,
              os, browser, browser_version, device_type, referrer, page,
              unique_visitors: uniqueVisitors,
              total_visits: totalVisits,
              is_returning: true,
              last_visit_ms: lastTrackedMs !== null ? Date.now() - lastTrackedMs : null,
            },
          })
          .then(({ data: fnData, error: fnError }) => {
            if (fnError) warn("Edge Function error (returning):", fnError);
            else log("Edge Function responded:", fnData);
          })
          .catch((e) => warn("Edge Function threw (returning):", e));

      } catch (unexpected) {
        err("Unexpected error in tracking flow:", unexpected);
      }
    }

    const timer = setTimeout(track, 1500);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);
}
