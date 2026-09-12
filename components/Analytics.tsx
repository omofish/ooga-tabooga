"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

/** Boots PostHog (no-op if NEXT_PUBLIC_POSTHOG_KEY isn't configured). Kept as
 *  its own component, mirroring ServiceWorkerRegister, so init lives outside
 *  the game's render path. */
export default function Analytics() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return null;
}
