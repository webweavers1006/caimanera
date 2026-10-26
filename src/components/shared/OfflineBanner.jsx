"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { PWA_CONFIG } from "@/features/shared";

/**
 * Global offline indicator for the player surface.
 * Sits above the mobile bottom nav and above the footer on desktop.
 * Optimistic initial state (`true`) avoids a flash during hydration.
 */
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const sync = () => setIsOnline(navigator.onLine);

    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);

    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 md:bottom-4"
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/70 bg-card/95 px-4 py-2 text-xs font-medium shadow-lg backdrop-blur-xl">
        <WifiOff className="size-4 text-primary" />
        {PWA_CONFIG.UI.OFFLINE}
      </div>
    </div>
  );
}
