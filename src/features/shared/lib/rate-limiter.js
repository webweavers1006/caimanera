/**
 * Generic Rate Limiter — Factory for creating per-module rate limiters.
 *
 * Design:
 * - Each module creates its own independent instance via createRateLimiter().
 * - Config hierarchy: env vars > module constants > factory defaults.
 * - Fixed window algorithm with in-memory Map (O(1) lookups).
 * - Automatic stale-entry cleanup prevents memory leaks.
 * - Ready for future backends (Redis, DB) — consumers only call checkLimit/resetLimit.
 *
 * Usage:
 *   const loginLimiter = createRateLimiter({ maxAttempts: 5, windowMs: 15 * 60 * 1000, name: 'auth:login' })
 *   const { allowed, remaining } = loginLimiter.checkLimit(ip)
 */

import { logger } from './logger'

const DEFAULT_MAX_ATTEMPTS = 5
const DEFAULT_WINDOW_MS = 15 * 60 * 1000      // 15 minutes
const CLEANUP_INTERVAL_MS = 60_000              // clean stale entries every 60s
const DEFAULT_MAX_ENTRIES = 10_000              // prevent unbounded Map growth under high traffic

// Track all active stores for centralized cleanup (one timer for all instances)
const activeStores = new Set()

// Single global cleanup timer
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cutoff = Date.now()
    for (const { store, windowMs } of activeStores) {
      for (const [key, entry] of store) {
        if (cutoff - entry.windowStart > windowMs) {
          store.delete(key)
        }
      }
    }
  }, CLEANUP_INTERVAL_MS).unref?.()
}

/**
 * Creates a new rate limiter instance with its own independent store.
 *
 * @param {Object} options
 * @param {number} [options.maxAttempts]  - Max allowed attempts per window (default: 5).
 * @param {number} [options.windowMs]     - Time window in milliseconds (default: 15 min).
 * @param {string} [options.name]         - Human-readable name for logging (default: 'unnamed').
 * @param {number} [options.maxEntries]   - Max entries before LRU eviction (default: 10000).
 * @returns {{ checkLimit: Function, resetLimit: Function, getStats: Function, listEntries: Function }}
 */
export function createRateLimiter(options = {}) {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS
  const name = options.name ?? 'unnamed'
  const maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES

  const store = new Map()

  // Register for cleanup
  activeStores.add({ store, windowMs })

  /**
   * Evicts the oldest entry (by insertion order) when the store exceeds maxEntries.
   * Map maintains insertion order, so keys().next() gives the oldest key.
   */
  function evictIfNeeded() {
    if (store.size > maxEntries) {
      const oldestKey = store.keys().next().value
      if (oldestKey) store.delete(oldestKey)
    }
  }

  /**
   * Checks if a request identified by `key` is allowed under the rate limit.
   *
   * @param {string} key - Unique client identifier (IP, userId, API key, etc.)
   * @returns {{ allowed: boolean, remaining: number, resetTime: Date }}
   */
  function checkLimit(key) {
    const now = Date.now()

    // Handle edge case: empty or invalid key
    if (!key || typeof key !== 'string') {
      logger.warn(`[RateLimiter:${name}] Invalid key type: ${typeof key}`)
      return { allowed: false, remaining: 0, resetTime: new Date(now + windowMs) }
    }

    const entry = store.get(key)

    // No previous entry or window expired → fresh window
    if (!entry || now - entry.windowStart > windowMs) {
      evictIfNeeded()
      store.set(key, { count: 1, windowStart: now })
      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetTime: new Date(now + windowMs),
      }
    }

    // Within window and over limit → blocked
    if (entry.count >= maxAttempts) {
      const resetTime = new Date(entry.windowStart + windowMs)
      logger.warn(`[RateLimiter:${name}] Rate limited key: ${key.substring(0, 8)}...`)
      return { allowed: false, remaining: 0, resetTime }
    }

    // Within window and under limit → allow, increment counter
    entry.count++
    return {
      allowed: true,
      remaining: maxAttempts - entry.count,
      resetTime: new Date(entry.windowStart + windowMs),
    }
  }

  /**
   * Resets the rate limit for a given key.
   * Useful for testing, admin unlocks, or successful authentication.
   *
   * @param {string} key - The client key to reset.
   * @returns {boolean} True if an entry existed and was removed.
   */
  function resetLimit(key) {
    return store.delete(key)
  }

  /**
   * Returns current statistics for monitoring/debugging.
   *
   * @returns {{ name: string, activeEntries: number, maxAttempts: number, windowMs: number }}
   */
  function getStats() {
    return {
      name,
      activeEntries: store.size,
      maxAttempts,
      windowMs,
    }
  }

  /**
   * Returns a snapshot of all active entries (admin diagnostics / unlock panel).
   * Skips entries whose window already expired (cleanup runs lazily every 60s).
   *
   * @returns {Array<{ key: string, count: number, windowStart: number, resetTime: Date }>}
   */
  function listEntries() {
    const now = Date.now()
    const entries = []
    for (const [key, entry] of store) {
      if (now - entry.windowStart > windowMs) continue
      entries.push({
        key,
        count: entry.count,
        windowStart: entry.windowStart,
        resetTime: new Date(entry.windowStart + windowMs),
      })
    }
    return entries
  }

  return { checkLimit, resetLimit, getStats, listEntries }
}
