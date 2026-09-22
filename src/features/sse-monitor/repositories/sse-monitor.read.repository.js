/**
 * SSE Monitor — read repository.
 *
 * Wraps the in-memory ConnectionTracker and the Users repository
 * to provide connection stats enriched with user display names.
 * This isolates Prisma access from the service layer.
 *
 * @module sse-monitor/repositories/sse-monitor.read.repository
 */

import { connectionTracker } from "@/features/sse-monitor/lib/connection-tracker";
import { findUsersForCredentials } from "@/features/users/repositories/user.read.repository";
import { SSE_MONITOR_CONFIG } from "@/features/sse-monitor/config/sse-monitor.constants";

const { ANOMALY, WARN } = SSE_MONITOR_CONFIG.THRESHOLDS;
const { NORMAL, WARNING, ANOMALY: STATUS_ANOMALY } = SSE_MONITOR_CONFIG.STATUS;

/**
 * Fetches raw connection stats from the in-memory tracker.
 * No DB I/O — pure Map read.
 *
 * @returns {{ totalConnections: number, uniqueUsers: number, connectionsPerUser: Array }}
 */
function getRawStats() {
  return connectionTracker.getStats();
}

/**
 * Resolves userId → userName via a single batch Prisma query.
 * NOT N+1: all userIds are sent in one IN clause.
 *
 * @param {string[]} userIds
 * @returns {Promise<Map<string, string>>} userId → userName
 */
async function resolveUserNames(userIds) {
  if (userIds.length === 0) return new Map();

  try {
    const users = await findUsersForCredentials(userIds);
    const map = new Map();
    for (const u of users) {
      map.set(u.id, [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || u.id);
    }
    return map;
  } catch {
    return new Map();
  }
}

/**
 * Computes the anomaly status for a connection count.
 * @param {number} count
 * @returns {string} NORMAL | WARNING | ANOMALY
 */
function computeStatus(count) {
  if (count >= ANOMALY) return STATUS_ANOMALY;
  if (count >= WARN) return WARNING;
  return NORMAL;
}

/**
 * Fetches enriched connection stats with resolved user display names
 * and computed anomaly status per user.
 *
 * @returns {Promise<{
 *   totalConnections: number,
 *   uniqueUsers: number,
 *   connectionsPerUser: Array<{userId: string, userName: string, connections: number, status: string}>,
 *   timestamp: string
 * }>}
 */
export async function findConnectionStats() {
  const raw = getRawStats();

  if (raw.connectionsPerUser.length === 0) {
    return { ...raw, timestamp: new Date().toISOString() };
  }

  const userIds = raw.connectionsPerUser.map((e) => e.userId);
  const userNameMap = await resolveUserNames(userIds);

  const connectionsPerUser = raw.connectionsPerUser.map((entry) => ({
    userId: entry.userId,
    userName: userNameMap.get(entry.userId) || entry.userId,
    connections: entry.connections,
    status: computeStatus(entry.connections),
  }));

  return {
    totalConnections: raw.totalConnections,
    uniqueUsers: raw.uniqueUsers,
    connectionsPerUser,
    timestamp: new Date().toISOString(),
  };
}
