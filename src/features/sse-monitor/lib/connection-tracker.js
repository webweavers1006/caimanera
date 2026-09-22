/**
 * SSE Monitor — connection tracking & anomaly detection.
 *
 * Singleton in-memory tracker (no DB, no I/O) that counts active SSE
 * connections per userId. Used by:
 *   - route.js (SSE endpoint) → add/remove on connect/disconnect
 *   - sse-monitor.read.service.js → getStats() for admin dashboard
 *
 * Thresholds (no blocking, only logging):
 *   🟢 1-6   — normal (multiple browser tabs)
 *   🟡 7-15  — suspicious (possible cleanup bug, orphaned listeners)
 *   🔴 16+   — anomalous (likely a bug or abuse)
 *
 * @module sse-monitor/lib/connection-tracker
 */

import { logger } from "@/features/shared/lib/logger";
import { eventBus } from "@/features/shared/lib/event-bus";
import { SSE_EVENTS } from "@/features/shared/config/event.constants";
import { SSE_MONITOR_CONFIG } from "@/features/sse-monitor/config/sse-monitor.constants";

const SYMBOL = Symbol.for("app.connectionTracker");

const { WARN, ANOMALY } = SSE_MONITOR_CONFIG.THRESHOLDS;

class ConnectionTracker {
  /** @type {Map<string, number>} userId → active SSE connection count */
  _connections = new Map();

  /**
   * Registers a new SSE connection for the given user.
   * Called at the start of each SSE stream.
   *
   * @param {string} userId
   * @returns {number} new connection count for this user
   */
  add(userId) {
    const count = (this._connections.get(userId) || 0) + 1;
    this._connections.set(userId, count);

    if (count >= ANOMALY) {
      logger.warn("SSE anomaly: user has ≥16 active connections", { userId, count });
    } else if (count >= WARN) {
      logger.warn("SSE threshold: user has ≥7 active connections", { userId, count });
    }

    // Notify admin dashboard in real time via SSE
    eventBus.emit(SSE_EVENTS.SSE_CONNECTIONS_CHANGED, {});

    return count;
  }

  /**
   * Deregisters an SSE connection for the given user.
   * Called in the cleanup() of each SSE stream.
   *
   * @param {string} userId
   * @returns {number} remaining connection count (0 if user fully disconnected)
   */
  remove(userId) {
    const count = this._connections.get(userId);
    if (!count) return 0;

    if (count <= 1) {
      this._connections.delete(userId);
    } else {
      this._connections.set(userId, count - 1);
    }

    // Notify admin dashboard in real time via SSE
    eventBus.emit(SSE_EVENTS.SSE_CONNECTIONS_CHANGED, {});

    return count <= 1 ? 0 : count - 1;
  }

  /**
   * Returns a snapshot of all active SSE connections.
   * O(n) where n = number of unique connected users.
   *
   * @returns {{ totalConnections: number, uniqueUsers: number, connectionsPerUser: Array<{userId: string, connections: number}>, timestamp: string }}
   */
  getStats() {
    let totalConnections = 0;
    const connectionsPerUser = [];

    for (const [userId, count] of this._connections) {
      totalConnections += count;
      connectionsPerUser.push({ userId, connections: count });
    }

    // Sort by connections descending — heaviest users first
    connectionsPerUser.sort((a, b) => b.connections - a.connections);

    return {
      totalConnections,
      uniqueUsers: this._connections.size,
      connectionsPerUser,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Total number of unique users with at least one active SSE connection.
   */
  get size() {
    return this._connections.size;
  }
}

// True singleton via globalThis — survives Turbopack/Next.js module recompilation
if (!globalThis[SYMBOL]) {
  globalThis[SYMBOL] = new ConnectionTracker();
}

export const connectionTracker = globalThis[SYMBOL];
