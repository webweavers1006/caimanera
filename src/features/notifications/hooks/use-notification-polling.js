import { useState, useEffect, useCallback, useRef } from "react";
import { NOTIFICATION_CONFIG } from "@/features/notifications";

const { INTERVAL_MS, SWR_THRESHOLD_MS } = NOTIFICATION_CONFIG.POLLING;

/**
 * Hook: polls GET /api/notifications/unread-count every 30s.
 *
 * Returns the unread count and a refresh trigger.
 * Handles SWR-like throttling, cleanup, and graceful error recovery.
 *
 * @returns {{ unreadCount: number, isLoading: boolean, refresh: () => void }}
 */
export function useNotificationPolling() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const lastFetchRef = useRef(0);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchCount = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchRef.current < SWR_THRESHOLD_MS) return;

    try {
      lastFetchRef.current = now;
      const res = await fetch("/api/notifications/unread-count", {
        cache: "no-store",
      });
      if (!res.ok || !mountedRef.current) return;
      const data = await res.json();
      if (mountedRef.current) {
        setUnreadCount(data.count ?? 0);
      }
    } catch {
      // Silently fail — keep last known count
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchCount(true);
    intervalRef.current = setInterval(() => fetchCount(), INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchCount]);

  const refresh = useCallback(() => fetchCount(true), [fetchCount]);

  return { unreadCount, isLoading, refresh };
}
