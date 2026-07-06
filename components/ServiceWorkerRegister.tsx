"use client";

import { useEffect } from "react";

/**
 * Registers the offline service worker so the game can be installed to the home
 * screen and played without a connection. Only runs in production — in dev the
 * SW would cache Turbopack/HMR assets and serve stale code.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {
          // Registration is best-effort; the app still works online without it.
        });
    };

    // Register after load so it doesn't compete with the first paint.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
