import posthog from "posthog-js";
import { isStandalone } from "./pwa";

// Unset until NEXT_PUBLIC_POSTHOG_KEY is configured (see docs/architecture.md)
// — track() stays a silent no-op the whole time, so analytics is opt-in by
// deploy config, not a hard dependency for running the game.
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let ready = false;

function ensureInit() {
  if (ready || !KEY || typeof window === "undefined") return;
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
