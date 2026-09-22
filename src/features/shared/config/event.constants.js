/**
 * Real-time event name constants & SSE timing configuration.
 * Single source of truth for all SSE event types and connection parameters
 * used across the application (event-bus.js, route.js, sse-provider.jsx).
 *
 * Usage:
 *   import { SSE_EVENTS, SSE_CONFIG } from "@/features/shared/config/event.constants";
 *   eventBus.emit(SSE_EVENTS.CASE_FORWARDED, { caseId: 47 });
 *   const delay = SSE_CONFIG.RECONNECT.BASE_MS + Math.random() * SSE_CONFIG.RECONNECT.JITTER_MS;
 */

export const SSE_EVENTS = {
  /** A case was forwarded to a direction/unit */
  CASE_FORWARDED: "case:forwarded",

  /** An operator claimed a case (atomic lock acquired) */
  CASE_CLAIMED: "case:claimed",

  /** An operator released a previously claimed case */
  CASE_RELEASED: "case:released",

  /** Dashboard metrics changed (case created/updated/closed/forwarded) */
  METRICS_UPDATED: "metrics:updated",

  /** A user's unread notification count changed (new notification, mark read, mark all read).
   *  Payload: { userId } — the user whose count changed. SSE route filters by session. */
  NOTIFICATION_UNREAD_COUNT: "notification:unread-count",

  /** Stream connection established successfully */
  CONNECTED: "connected",

  /** SSE connection count changed (user connected or disconnected).
   *  Payload: {} — signal only, clients re-fetch stats via Server Action. */
  SSE_CONNECTIONS_CHANGED: "sse:connections-changed",
};

/**
 * SSE connection timing parameters.
 * Shared between server (route.js) and client (sse-provider.jsx).
 */
export const SSE_CONFIG = {
  /** API route path for the authenticated SSE stream */
  STREAM_URL: "/api/events/stream",

  /** Heartbeat interval in ms — keep-alive comment sent to prevent proxy timeouts */
  HEARTBEAT_MS: 15000,

  /** Maximum SSE connection lifetime (8 hours = JWT session duration).
   *  Safety net that forcibly closes connections after session expiry. */
  MAX_CONNECTION_LIFETIME_MS: 8 * 60 * 60 * 1000,

  /** Client reconnection strategy with jitter to prevent thundering herd.
   *  BASE_MS + random(0, JITTER_MS) spreads 200+ clients across a 2-second window,
   *  reducing peak reconnect load by ~90%. */
  RECONNECT: {
    BASE_MS: 3000,
    JITTER_MS: 2000,
  },
};
