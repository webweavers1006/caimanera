"use client";

import { useCallback, useEffect, useRef } from "react";

const DEFAULT_INTERVAL_MS = 3000;

/**
 * Throttles a refresh callback with leading + trailing coalescing.
 *
 * Purpose: SSE events arrive in bursts — one claim emits 2 events, and every
 * mutation broadcasts to every connected user. Without throttling, each event
 * triggers router.refresh(), saturating the Next.js action queue and delaying
 * dropdown fetches and form submissions (the "stuck loading" symptom).
 *
 * Behavior:
 * - Leading edge: if >= intervalMs since the last run → run immediately.
 * - Trailing edge: otherwise schedule a SINGLE run when the window closes
 *   (all events inside the window are coalesced into one refresh).
 *
 * Maximum refresh rate: 1 run per intervalMs (default 3s) — realtime enough
 * for operator work while keeping the router queue healthy.
 *
 * @param {Function} refresh - Callback to invoke (e.g. () => router.refresh()).
 * @param {number} [intervalMs=3000] - Minimum interval between runs.
 * @returns {Function} Throttled callback (safe to reuse across event handlers).
 */
export function useThrottledRefresh(refresh, intervalMs = DEFAULT_INTERVAL_MS) {
  const refreshRef = useRef(refresh);
  const lastRunRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  // Clear the pending trailing refresh on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastRunRef.current;

    if (elapsed >= intervalMs) {
      lastRunRef.current = now;
      refreshRef.current?.();
      return;
    }

    // Coalesce events inside the window into a single trailing refresh
    if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        lastRunRef.current = Date.now();
        refreshRef.current?.();
      }, intervalMs - elapsed);
    }
  }, [intervalMs]);
}
