import { getLoginLimiterStats, listBlockedLoginIps } from '../lib/rate-limiter'

/**
 * Read service for the login-locks admin panel.
 *
 * Reads directly from the in-memory login rate limiter. There is no
 * repository layer here on purpose: rate-limit counters are transient
 * infrastructure state, not domain entities persisted in the database.
 */

/**
 * Lists IPs currently blocked by the login rate limiter.
 *
 * @returns {Array<{ ip: string, attempts: number, resetTime: Date }>}
 */
export function fetchBlockedLoginIps() {
  return listBlockedLoginIps().map((entry) => ({
    ip: entry.key,
    attempts: entry.count,
    resetTime: entry.resetTime,
  }))
}

/**
 * Returns limiter stats (maxAttempts, windowMs, activeEntries) for the panel.
 *
 * @returns {{ name: string, activeEntries: number, maxAttempts: number, windowMs: number }}
 */
export function fetchLoginLimiterStats() {
  return getLoginLimiterStats()
}
