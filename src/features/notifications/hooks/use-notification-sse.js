"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSseSubscription } from "@/components/shared/providers/sse-provider";
import { SSE_EVENTS } from "@/features/shared/config/event.constants";

/**
 * Hook: receives notification unread count updates via the shared SSE connection.
 *
 * No longer opens its own EventSource — uses SseProvider (1 connection per tab).
 * When a "notification:unread-count" event arrives, refetches the count
 * from GET /api/notifications/unread-count.
 *
 * @returns {{ unreadCount: number, isLoading: boolean, refresh: () => void }}
 */
export function useNotificationSSE() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchCount = useCallback(async () => {
    try {
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

  // Subscribe to the shared SSE connection — no separate EventSource needed
  useSseSubscription(SSE_EVENTS.NOTIFICATION_UNREAD_COUNT, () => {
    if (mountedRef.current) fetchCount();
  });

  useEffect(() => {
    mountedRef.current = true;
    fetchCount();
    return () => { mountedRef.current = false; };
  }, [fetchCount]);

  const refresh = useCallback(() => fetchCount(), [fetchCount]);

  return { unreadCount, isLoading, refresh };
}
