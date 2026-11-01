import posthog from "posthog-js";
import { isStandalone } from "./pwa";

// Unset until NEXT_PUBLIC_POSTHOG_KEY is configured (see docs/architecture.md)
// — track() stays a silent no-op the whole time, so analytics is opt-in by
// deploy config, not a hard dependency for running the game.
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

const NOTRACK_KEY = "ooga-notrack";

let ready = false;
let optedOut: boolean | null = null;

/** True for traffic that shouldn't count: a device opted out via
 *  `?notrack=1` (sticky in localStorage until `?notrack=0`), browser
 *  automation (Playwright/Puppeteer/Selenium set `navigator.webdriver`), and
 *  local dev hosts. The `notrack` param is stripped from the URL either way. */
function isOptedOut(): boolean {
  if (optedOut !== null) return optedOut;
  const url = new URL(window.location.href);
  const param = url.searchParams.get("notrack");
  let stored = false;
  try {
    if (param === "0") localStorage.removeItem(NOTRACK_KEY);
    else if (param !== null) localStorage.setItem(NOTRACK_KEY, "1");
    stored = localStorage.getItem(NOTRACK_KEY) === "1";
  } catch {
    stored = param !== null && param !== "0"; // storage blocked: this visit only
  }
  if (param !== null) {
    url.searchParams.delete("notrack");
    window.history.replaceState(window.history.state, "", url);
  }
  const host = window.location.hostname;
  const local =
    host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  optedOut = stored || navigator.webdriver === true || local;
  return optedOut;
}

function ensureInit() {
  if (ready || typeof window === "undefined" || isOptedOut() || !KEY) return;
  posthog.init(KEY, {
    api_host: HOST,
    persistence: "localStorage", // no cookies, matches the rest of the app
    autocapture: false, // only the explicit events below are sent
    capture_pageview: false, // fired manually below, once is_pwa is registered
    capture_exceptions: true, // the app's only crash/error monitoring
    disable_session_recording: true,
  });
  ready = true;

  // Tag every event (this pageview included) with whether the game is
  // running installed-to-home-screen vs. a regular browser tab.
  posthog.register({ is_pwa: isStandalone() });
  posthog.capture("$pageview");

  // Chrome/Android only — iOS Safari has no equivalent event for a PWA
  // install completing, so install rate there has to come from is_pwa on
  // later pageviews instead.
  window.addEventListener("appinstalled", () => track("pwa_installed"));
}

/** Call once on mount (see components/Analytics.tsx) so the automatic
 *  pageview has something to attach to as early as possible. */
export function initAnalytics() {
  ensureInit();
}

/** Fire a custom analytics event. A silent no-op with no configured key, so
 *  callers never need to guard this themselves. */
export function track(
  event: string,
  props?: Record<string, string | number | boolean | null>,
) {
  ensureInit();
  if (!ready) return;
  posthog.capture(event, props);
}
