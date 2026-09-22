/**
 * GET /api/events/stream — SSE (Server-Sent Events) endpoint.
 *
 * Opens a long-lived connection that pushes real-time events to the client:
 *   - case:forwarded  { caseId, directionId, unitId }
 *   - case:claimed    { caseId, userId }
 *   - case:released   { caseId, userId }
 *   - metrics:updated {}
 *
 * Authentication: session cookie (same-origin EventSource sends cookies automatically).
 */

import { eventBus } from "@/features/shared/lib/event-bus";
import { getSession } from "@/features/auth/lib/auth";
import { SSE_EVENTS, SSE_CONFIG } from "@/features/shared/config/event.constants";
import { connectionTracker } from "@/features/sse-monitor/lib/connection-tracker";

export async function GET(request) {
  const session = await getSession();

  if (!session?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.id;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      /**
       * Cleans up all EventBus listeners + heartbeat + lifetime timeout.
       * Called on: normal abort, enqueue failure (half-open TCP), and
       * max lifetime expiry. Guarantees zero listener leaks.
       *
       * Each SSE connection registers 6 EventBus listeners. With EventBus
       * setMaxListeners(250) and the 5-minute monitoring interval, any leak
       * would be detected within 5 minutes. This cleanup ensures it never
       * reaches that threshold.
       */
      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        clearTimeout(lifetimeTimeout);
        connectionTracker.remove(userId);
        eventBus.removeListener(SSE_EVENTS.CASE_FORWARDED, onForwarded);
        eventBus.removeListener(SSE_EVENTS.CASE_CLAIMED, onClaimed);
        eventBus.removeListener(SSE_EVENTS.CASE_RELEASED, onReleased);
        eventBus.removeListener(SSE_EVENTS.METRICS_UPDATED, onMetricsUpdated);
        eventBus.removeListener(SSE_EVENTS.NOTIFICATION_UNREAD_COUNT, onNotificationUnreadCount);
        eventBus.removeListener(SSE_EVENTS.SSE_CONNECTIONS_CHANGED, onConnectionsChanged);
        try { controller.close(); } catch { /* already closed */ }
      };

      /**
       * Writes an SSE event to the client.
       * Uses setImmediate to defer the actual enqueue, preventing the
       * synchronous EventEmitter.emit() chain from blocking the event loop.
       * With 100+ concurrent SSE connections, this reduces emit() blocking
       * from ~5ms to ~0.01ms per event.
       */
      const writeEvent = (event, data) => {
        if (closed) return;
        // Pre-compute the encoded message while still in the sync chain.
        // This is CPU-only and fast — the blocking part is controller.enqueue().
        const encoded = encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        // Defer the actual write to the next check phase — yields the event loop
        // so other requests (DB queries, page renders) aren't starved.
        setImmediate(() => {
          if (closed) return;
          try {
            controller.enqueue(encoded);
          } catch {
            cleanup();
          }
        });
      };

      /**
       * Writes an SSE comment (used for heartbeat keep-alive).
       * Also deferred via setImmediate to avoid blocking the heartbeat timer
       * from starving the event loop when many connections are active.
       */
      const writeComment = (text) => {
        if (closed) return;
        const encoded = encoder.encode(`: ${text}\n\n`);
        setImmediate(() => {
          if (closed) return;
          try {
            controller.enqueue(encoded);
          } catch {
            cleanup();
          }
        });
      };

      // Register this connection in the tracker (admin monitoring + anomaly detection)
      connectionTracker.add(userId);

      // Send initial connected event
      writeEvent(SSE_EVENTS.CONNECTED, { userId });

      // Event handlers
      const onForwarded = (payload) => writeEvent(SSE_EVENTS.CASE_FORWARDED, payload);

      const onClaimed = (payload) => {
        if (payload.userId !== userId) {
          writeEvent(SSE_EVENTS.CASE_CLAIMED, payload);
        }
      };

      const onReleased = (payload) => writeEvent(SSE_EVENTS.CASE_RELEASED, payload);
      const onMetricsUpdated = (payload) => writeEvent(SSE_EVENTS.METRICS_UPDATED, payload ?? {});

      const onNotificationUnreadCount = (payload) => {
        // Only forward to the intended user's stream
        if (payload.userId === userId) {
          writeEvent(SSE_EVENTS.NOTIFICATION_UNREAD_COUNT, {});
        }
      };

      // SSE connection count changed — signal admin dashboard to refresh stats
      const onConnectionsChanged = () => writeEvent(SSE_EVENTS.SSE_CONNECTIONS_CHANGED, {});

      // Subscribe to EventBus
      eventBus.on(SSE_EVENTS.CASE_FORWARDED, onForwarded);
      eventBus.on(SSE_EVENTS.CASE_CLAIMED, onClaimed);
      eventBus.on(SSE_EVENTS.CASE_RELEASED, onReleased);
      eventBus.on(SSE_EVENTS.METRICS_UPDATED, onMetricsUpdated);
      eventBus.on(SSE_EVENTS.NOTIFICATION_UNREAD_COUNT, onNotificationUnreadCount);
      eventBus.on(SSE_EVENTS.SSE_CONNECTIONS_CHANGED, onConnectionsChanged);

      // Heartbeat — keeps the TCP connection alive through proxies/firewalls.
      // .unref() ensures the timer doesn't prevent Node.js graceful shutdown
      // (the ReadableStream itself keeps the request alive, not the timer).
      const heartbeat = setInterval(() => writeComment("heartbeat"), SSE_CONFIG.HEARTBEAT_MS);
      heartbeat.unref();

      // Max lifetime — safety net. Closes connection after session expiry (8h).
      // Prevents zombie connections from outliving the JWT session and accumulating
      // orphaned EventBus listeners indefinitely.
      const lifetimeTimeout = setTimeout(() => {
        writeComment("session-expired");
        cleanup();
      }, SSE_CONFIG.MAX_CONNECTION_LIFETIME_MS);
      lifetimeTimeout.unref();

      // Cleanup on disconnect (normal path — client closes connection)
      request.signal.addEventListener("abort", cleanup, { once: true });
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
