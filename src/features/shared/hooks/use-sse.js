"use client";

import { useSseConnection, useSseSubscription } from "@/components/shared/providers/sse-provider";
import { SSE_EVENTS } from "@/features/shared/config/event.constants";

/**
 * useSSE — React hook for Server-Sent Events real-time updates.
 *
 * Consumes the shared SseProvider (one EventSource per tab) instead of
 * creating its own connection. Reduces connections from ~3 per user to 1,
 * eliminating the MaxListenersExceededWarning and cutting server load.
 *
 * @param {Object} [handlers] — Event name → callback mapping
 * @param {Function} [handlers.onConnected]
 * @param {Function} [handlers.onForwarded]
 * @param {Function} [handlers.onClaimed]
 * @param {Function} [handlers.onReleased]
 * @param {Function} [handlers.onMetricsUpdated]
 * @returns {{ isConnected: boolean }}
 */
export function useSSE(handlers = {}) {
  const { isConnected } = useSseConnection();

  useSseSubscription(SSE_EVENTS.CONNECTED, handlers.onConnected, { enabled: !!handlers.onConnected });
  useSseSubscription(SSE_EVENTS.CASE_FORWARDED, handlers.onForwarded, { enabled: !!handlers.onForwarded });
  useSseSubscription(SSE_EVENTS.CASE_CLAIMED, handlers.onClaimed, { enabled: !!handlers.onClaimed });
  useSseSubscription(SSE_EVENTS.CASE_RELEASED, handlers.onReleased, { enabled: !!handlers.onReleased });
  useSseSubscription(SSE_EVENTS.METRICS_UPDATED, handlers.onMetricsUpdated, { enabled: !!handlers.onMetricsUpdated });

  return { isConnected };
}
