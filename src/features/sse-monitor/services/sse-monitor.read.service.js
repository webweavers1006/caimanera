/**
 * SSE Monitor — read service.
 *
 * Delegates to the sse-monitor read repository for enriched connection stats.
 * No direct access to connection-tracker or user repository — follows A-S-R-M.
 *
 * @module sse-monitor/services/sse-monitor.read.service
 */

import { findConnectionStats } from "@/features/sse-monitor/repositories/sse-monitor.read.repository";

/**
 * Fetches live SSE connection stats with resolved user display names
 * and anomaly status per user.
 *
 * @returns {Promise<{
 *   totalConnections: number,
 *   uniqueUsers: number,
 *   connectionsPerUser: Array<{userId: string, userName: string, connections: number, status: string}>,
 *   timestamp: string
 * }>}
 */
export async function fetchConnectionStats() {
  return findConnectionStats();
}
