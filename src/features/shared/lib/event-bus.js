/**
 * EventBus — Centralized event emitter for in-process and cross-worker communication.
 *
 * Architecture:
 * - Single-worker mode: pure Node.js EventEmitter in memory. Zero latency, zero dependencies.
 * - Cluster mode (optional): PostgreSQL LISTEN/NOTIFY bridge so workers share events.
 *   Call eventBus.enableClusterBridge() on startup when PM2 cluster is active.
 *
 * Events:
 * - case:forwarded  { caseId, directionId, unitId }
 * - case:claimed    { caseId, userId }
 * - case:released   { caseId, userId }
 * - metrics:updated {}
 *
 * Security: the EventBus runs server-side only. Never exposed to clients directly.
 * Clients receive events exclusively through the authenticated SSE stream.
 */

import { EventEmitter } from "node:events";
import { logger } from "@/features/shared/lib/logger";
import { SSE_EVENTS } from "@/features/shared/config/event.constants";

const CHANNEL = "case_event";

/**
 * Signal events with no per-event payload semantics — clients treat them as
 * "something changed, refresh". Coalesced on the server so a burst of
 * mutations produces at most one broadcast per window instead of N broadcasts
 * fanned out to every connected SSE stream.
 */
const COALESCABLE_EVENTS = new Set([
  SSE_EVENTS.METRICS_UPDATED,
  SSE_EVENTS.SSE_CONNECTIONS_CHANGED,
]);

/** Coalescing window in ms (leading edge emits immediately, then burst events
 *  are merged into a single trailing emit at the end of the window). */
const COALESCE_WINDOW_MS = 1000;

class EventBus extends EventEmitter {
  #pgClient = null;
  #bridgeEnabled = false;
  #statsInterval = null;

  constructor() {
    super();
    // 5 events × 50 concurrent SSE connections × 2 (headroom) = 250.
    // With the shared SseProvider (1 EventSource per tab), this is more than enough.
    // If exceeded, it still indicates orphaned listeners not cleaned up.
    this.setMaxListeners(250);
    this._coalescePayloads = new Map();
    this._coalesceSeq = new Map();
    this._coalesceTimers = new Map();
  }

  /**
   * Returns listener counts per event for monitoring/debugging memory leaks.
   * @returns {Record<string, number>}
   */
  getListenerStats() {
    const stats = {};
    for (const eventName of this.eventNames()) {
      stats[eventName] = this.listenerCount(eventName);
    }
    return stats;
  }

  /**
   * Enables cross-worker communication via PostgreSQL LISTEN/NOTIFY.
   * Only call this once at startup. Safe to call in single-worker mode
   * (it will work fine, just with a small overhead).
   *
   * Uses a dedicated pg Client — separate from Prisma's connection pool.
   * LISTEN/NOTIFY is per-connection, so each worker needs its own listener.
   *
   * @returns {Promise<void>}
   */
  async enableClusterBridge() {
    if (this._bridgeEnabled) return;
    this._bridgeEnabled = true;

    try {
      // Dynamic import — pg may not be directly imported elsewhere in shared/
      const { Client } = await import("pg");

      this._pgClient = new Client({
        connectionString: process.env.DATABASE_URL,
        // KeepAlive: prevent firewalls/proxies from dropping the idle LISTEN connection
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      });

      await this._pgClient.connect();
      await this._pgClient.query(`LISTEN ${CHANNEL}`);

      // When another worker emits via pg_notify, re-emit locally
      this._pgClient.on("notification", (msg) => {
        try {
          if (msg.channel === CHANNEL && msg.payload) {
            const { event, payload } = JSON.parse(msg.payload);
            super.emit(event, payload);
          }
        } catch (err) {
          logger.error("EventBus: failed to parse notification", {
            error: err.message,
            channel: msg.channel,
          });
        }
      });

      // Reconnect on connection loss (e.g., PostgreSQL restart)
      this._pgClient.on("end", () => {
        logger.warn("EventBus: pg listener disconnected, will retry in 5s");
        this._bridgeEnabled = false;
        setTimeout(() => this.enableClusterBridge(), 5000);
      });

      this._pgClient.on("error", (err) => {
        logger.error("EventBus: pg listener error", { error: err.message });
      });

      logger.info("EventBus: cluster bridge enabled via PostgreSQL LISTEN/NOTIFY");
    } catch (error) {
      logger.error("EventBus: failed to enable cluster bridge", { error: error.message });
      this._bridgeEnabled = false;
    }
  }

  /**
   * Emits an event locally and (if bridge enabled) to all other workers via PostgreSQL.
   *
   * Skips pg_notify when no local listeners exist for this event type,
   * avoiding unnecessary DB round-trips during low-traffic periods.
   *
   * @param {string} event - Event name (e.g., 'case:forwarded')
   * @param {Object} payload - Serializable payload (no functions, no circular refs)
   */
  emit(event, payload) {
    if (COALESCABLE_EVENTS.has(event)) {
      this._coalesceEmit(event, payload);
      return;
    }
    this._emitNow(event, payload);
  }

  /**
   * Leading + trailing coalescing for signal events.
   * First event emits immediately; subsequent events of the same type inside
   * the window are merged into a single trailing emit.
   */
  _coalesceEmit(event, payload) {
    const seq = (this._coalesceSeq.get(event) || 0) + 1;
    this._coalesceSeq.set(event, seq);
    this._coalescePayloads.set(event, payload ?? {});

    if (this._coalesceTimers.has(event)) return; // burst — merged into trailing emit

    const emittedSeq = seq;
    this._emitNow(event, payload ?? {});

    const timer = setTimeout(() => {
      this._coalesceTimers.delete(event);
      const latestSeq = this._coalesceSeq.get(event) || 0;
      const latest = this._coalescePayloads.get(event);
      this._coalescePayloads.delete(event);
      this._coalesceSeq.delete(event);
      // Emit trailing only if new events arrived after the leading emit.
      if (latestSeq > emittedSeq && latest !== undefined) {
        this._emitNow(event, latest);
      }
    }, COALESCE_WINDOW_MS);
    timer.unref?.();
    this._coalesceTimers.set(event, timer);
  }

  /**
   * Immediate emit: local subscribers + (if bridge enabled) pg_notify to other workers.
   *
   * Skips pg_notify when no local listeners exist for this event type,
   * avoiding unnecessary DB round-trips during low-traffic periods.
   */
  _emitNow(event, payload) {
    // Always emit locally for same-worker subscribers (SSE streams)
    super.emit(event, payload);

    // Cross-worker bridge: skip pg_notify if no local listeners (no SSE connections open)
    if (!this._bridgeEnabled || !this._pgClient) return;
    if (this.listenerCount(event) === 0) return;

    const data = JSON.stringify({ event, payload: payload ?? {} });
    this._pgClient
      .query("SELECT pg_notify($1, $2)", [CHANNEL, data])
      .catch((err) => {
        logger.error("EventBus: pg_notify failed", { error: err.message, event });
      });
  }

  /**
   * Gracefully closes the PostgreSQL listener connection and clears stats interval.
   * Call on process shutdown (SIGTERM/SIGINT).
   */
  async shutdown() {
    if (this._statsInterval) {
      clearInterval(this._statsInterval);
      this._statsInterval = null;
      logger.info("EventBus: stats interval cleared");
    }
    for (const timer of this._coalesceTimers.values()) clearTimeout(timer);
    this._coalesceTimers.clear();
    this._coalescePayloads.clear();
    this._coalesceSeq.clear();
    if (this._pgClient) {
      try {
        await this._pgClient.end();
        logger.info("EventBus: pg listener closed");
      } catch (err) {
        logger.error("EventBus: error closing pg listener", { error: err.message });
      }
    }
  }

  /**
   * Whether the cluster bridge is active.
   */
  get isBridgeEnabled() {
    return this._bridgeEnabled;
  }
}

// True singleton via globalThis — Next.js/Turbopack may create multiple module
// instances for server actions vs API routes, but globalThis is always shared.
// This guarantees that events emitted from a server action reach the SSE endpoint.
const SYMBOL = Symbol.for("app.eventBus");

if (!globalThis[SYMBOL]) {
  globalThis[SYMBOL] = new EventBus();

  // Log listener counts every 5 minutes to detect orphaned SSE listeners.
  // If any event type exceeds 50 listeners, it indicates a leak.
  if (typeof setInterval !== "undefined" && process.env.NODE_ENV === "production") {
    globalThis[SYMBOL]._statsInterval = setInterval(() => {
      const stats = globalThis[SYMBOL].getListenerStats();
      const total = Object.values(stats).reduce((sum, n) => sum + n, 0);
      logger.info(`EventBus listener stats — total: ${total}`, stats);
    }, 5 * 60 * 1000);
    globalThis[SYMBOL]._statsInterval.unref?.();
  }
}

export const eventBus = globalThis[SYMBOL];
