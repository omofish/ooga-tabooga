"use client";

import { useEffect } from "react";
import { BASE_PATH } from "@/lib/base-path";

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
        .register(`${BASE_PATH}/sw.js`, {
          scope: `${BASE_PATH}/`,
          updateViaCache: "none",
        })
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
