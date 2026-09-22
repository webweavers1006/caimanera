/**
 * Auth Module Rate Limiter — Thin wrapper around the shared rate limiter factory.
 *
 * Configuration lives in {@link ../config/auth.constants.js AUTH_CONFIG.RATE_LIMIT}.
 * Single source of truth — no env var overrides. Keep it simple.
 *
 * This instance protects the login endpoint.
 * To rate-limit other auth operations (password reset, MFA), create additional instances.
 */

import { createRateLimiter } from '@/features/shared/lib/rate-limiter'
import { AUTH_CONFIG } from '../config/auth.constants'

// ── Named instance for login ─────────────────────────────────────────────────

export const loginRateLimiter = createRateLimiter({
  maxAttempts: AUTH_CONFIG.RATE_LIMIT.MAX_ATTEMPTS,
  windowMs: AUTH_CONFIG.RATE_LIMIT.WINDOW_MS,
  name: 'auth:login',
})

// ── Admin diagnostics / unlock helpers (server-only) ────────────────────────

/**
 * Lists IPs currently blocked (count >= maxAttempts), sorted by attempts desc.
 * Consumed by the login-locks page container (RSC) and admin actions.
 *
 * @returns {Array<{ key: string, count: number, resetTime: Date }>}
 */
export function listBlockedLoginIps() {
  const maxAttempts = AUTH_CONFIG.RATE_LIMIT.MAX_ATTEMPTS
  return loginRateLimiter
    .listEntries()
    .filter((entry) => entry.count >= maxAttempts)
    .sort((a, b) => b.count - a.count)
}

/**
 * Unlocks a blocked IP (removes its counter entry).
 *
 * @param {string} ip - Client IP key or 'unknown'.
 * @returns {boolean} True if an entry existed and was removed.
 */
export function unlockLoginIp(ip) {
  return loginRateLimiter.resetLimit(ip)
}

/**
 * Returns limiter stats (maxAttempts, windowMs, activeEntries) for the admin panel.
 *
 * @returns {{ name: string, activeEntries: number, maxAttempts: number, windowMs: number }}
 */
export function getLoginLimiterStats() {
  return loginRateLimiter.getStats()
}
