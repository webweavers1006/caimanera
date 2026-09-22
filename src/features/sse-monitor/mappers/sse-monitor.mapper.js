/**
 * SSE Monitor — mapper.
 *
 * Transforms enriched connection stats from the repository layer
 * into the domain format expected by the service and UI.
 *
 * @module sse-monitor/mappers/sse-monitor.mapper
 */

/**
 * Maps a single connection-per-user entry to domain format.
 * Currently a pass-through — the repository already returns the right shape.
 * Kept for architectural consistency and future transformation needs.
 *
 * @param {Object} entry — { userId, userName, connections, status }
 * @returns {Object}
 */
export function toDomain(entry) {
  return {
    userId: entry.userId,
    userName: entry.userName,
    connections: entry.connections,
    status: entry.status,
  };
}

/**
 * Maps a list of connection entries to domain format.
 * @param {Array<Object>} entries
 * @returns {Array<Object>}
 */
export function toDomainList(entries) {
  return entries.map(toDomain);
}

/**
 * Maps a domain-level sort key to the repository field name.
 * @param {string} domainKey — e.g. "userName", "connections", "status"
 * @returns {string} repository field name
 */
export function toSortKey(domainKey) {
  const mapping = {
    userName: "userName",
    connections: "connections",
    status: "status",
  };
  return mapping[domainKey] || domainKey;
}

/**
 * Maps domain filter/query params to persistence format.
 * Currently a pass-through — the repository handles raw Map data.
 * @param {Object} domain — filter params
 * @returns {Object}
 */
export function toPersistence(domain) {
  return { ...domain };
}
