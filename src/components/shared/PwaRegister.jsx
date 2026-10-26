"use client";

import { useEffect } from "react";

/**
 * Registers the PWA service worker in production only.
 *
 * Dev is skipped on purpose: Turbopack's hot reload and the worker cache fight
 * each other and make local debugging confusing. To test the worker locally,
 * run `pnpm build && pnpm start`.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {
          // Registration failures are not fatal: the app keeps working online.
        });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
