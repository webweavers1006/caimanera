import { headers } from 'next/headers'
import { logger } from './logger'

/**
 * Safely parses the origin from a Referer header.
 * Wraps new URL() in try/catch to prevent malformed Referer values
 * from bypassing CSRF via the outer catch's fail-open path.
 *
 * @param {string} referer - Raw Referer header value
 * @returns {string|null} Origin string or null if unparseable
 */
function safeParseOrigin(referer) {
  try {
    return new URL(referer).origin
  } catch {
    return null
  }
}

/**
 * CSRF Protection — validates that the request Origin/Referer
 * matches the Host header. Complements Next.js built-in Server Action
 * CSRF protection (Next-Action header).
 *
 * Server Actions are already protected by Next.js for form submissions.
 * This guard adds an extra layer for programmatic invocations
 * (direct fetch/JS calls to Server Actions from external origins).
 *
 * @throws {Error} If a cross-origin request is detected.
 */
export async function validateCsrf() {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')
    const referer = headersList.get('referer')
    const host = headersList.get('host')

    // No origin or referer → same-origin request (Next.js handles CSRF natively).
    // This is the case for form submissions and same-origin fetch calls.
    if (!origin && !referer) {
      return
    }

    // Extract origin from Referer if Origin header is absent
    const requestOrigin = origin || safeParseOrigin(referer)

    // Block if origin doesn't match host
    if (requestOrigin && host) {
      const isSameOrigin = requestOrigin.includes(host) || host.includes(requestOrigin)
      if (!isSameOrigin) {
        logger.warn('CSRF blocked', { origin: requestOrigin, host })
        throw new Error('CSRF validation failed')
      }
    }
  } catch (error) {
    // Re-throw CSRF validation errors; on unexpected errors, fail closed
    // (block the request) to avoid silent CSRF bypass.
    if (error.message === 'CSRF validation failed') {
      throw error
    }
    logger.error('CSRF guard error — blocking request', { error: error.message })
    throw new Error('CSRF validation failed')
  }
}
