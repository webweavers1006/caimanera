"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getConnectionStatsAction } from "@/features/sse-monitor/actions/sse-monitor.read.action";
import { useSseSubscription } from "@/components/shared/providers/sse-provider";
import { SSE_EVENTS } from "@/features/shared/config/event.constants";

/** Minimum interval between refreshes to prevent thundering herd */
const MIN_REFRESH_INTERVAL_MS = 2000;

/**
 * Hook — manages SSE connection stats state + real-time refresh.
 *
 * Encapsulates all data-fetching logic so the ConnectionStatsTable
 * component focuses purely on rendering.
 *
 * Debounces refreshes: after a server restart, 200 simultaneous SSE
 * reconnects would trigger 200 individual refreshes. The debounce caps
 * it at 1 refresh per 2 seconds.
 *
 * @param {Object} initialStats — server-side pre-fetched stats (SSR)
 * @returns {{ stats: Object, lastUpdated: Date|null, isLoading: boolean }}
 */
export function useSseMonitor(initialStats) {
  const [stats, setStats] = useState(initialStats);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastRefreshRef = useRef(0);
  const pendingRefreshRef = useRef(false);
  const trailingTimerRef = useRef(null);
  const refreshRef = useRef(null);

  // Set the initial timestamp on the client only (toLocaleTimeString is
  // timezone-sensitive and would cause a hydration mismatch).
  useEffect(() => {
    const timer = setTimeout(() => setLastUpdated(new Date()), 0);
    return () => clearTimeout(timer);
  }, []);

  const refresh = useCallback(async () => {
    const now = Date.now();

    // Debounce: skip if last refresh was less than MIN_REFRESH_INTERVAL_MS ago.
    // Schedule a trailing refresh to catch the latest state after the cooldown.
    if (now - lastRefreshRef.current < MIN_REFRESH_INTERVAL_MS) {
      if (!pendingRefreshRef.current) {
        pendingRefreshRef.current = true;
        trailingTimerRef.current = setTimeout(() => {
          pendingRefreshRef.current = false;
          refreshRef.current?.();
        }, MIN_REFRESH_INTERVAL_MS - (now - lastRefreshRef.current));
      }
      return;
    }

    lastRefreshRef.current = now;
    setIsLoading(true);
    try {
      const newStats = await getConnectionStatsAction();
      setStats(newStats);
      setLastUpdated(new Date());
    } catch {
      // Keep stale data on error — don't disrupt the dashboard
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRef.current = refresh;
    return () => {
      if (trailingTimerRef.current) clearTimeout(trailingTimerRef.current);
    };
  }, [refresh]);

  // Real-time refresh via SSE — when any user connects/disconnects,
  // connectionTracker emits sse:connections-changed → instant refresh.
  useSseSubscription(SSE_EVENTS.SSE_CONNECTIONS_CHANGED, refresh, { enabled: true });

  return { stats, lastUpdated, isLoading };
}
