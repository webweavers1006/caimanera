/**
 * Shared rate limiter instances for API routes.
 *
 * Each tier targets a different resource cost profile:
 *   - heavy: PDF/ZIP generation (10 req/min)
 *   - batch: Multi-PDF ZIP generation (5 req/min)
 *   - medium: File serving (30 req/min)
 *   - light: Polling/list endpoints (60 req/min)
 *
 * Usage in API routes:
 *   import { heavyApiLimiter } from "@/features/shared/lib/api-rate-limiter";
 *   const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
 *   const { allowed } = heavyApiLimiter.checkLimit(ip);
 *   if (!allowed) return NextResponse.json({ error: "Demasiadas peticiones" }, { status: 429 });
 */

import { createRateLimiter } from "@/features/shared/lib/rate-limiter";

/** PDF generation: 10 requests per minute per IP */
export const heavyApiLimiter = createRateLimiter({
  maxAttempts: 10,
  windowMs: 60_000,
  name: "api:heavy",
});

/** Batch ZIP generation: 5 requests per minute per IP */
export const batchApiLimiter = createRateLimiter({
  maxAttempts: 5,
  windowMs: 60_000,
  name: "api:batch",
});

/** File serving: 30 requests per minute per IP */
export const mediumApiLimiter = createRateLimiter({
  maxAttempts: 30,
  windowMs: 60_000,
  name: "api:medium",
});

/** Polling / list endpoints: 60 requests per minute per IP */
export const lightApiLimiter = createRateLimiter({
  maxAttempts: 60,
  windowMs: 60_000,
  name: "api:light",
});

/**
 * Extracts the client IP from the request headers.
 * Checks x-forwarded-for (proxy/CDN) with fallback.
 *
 * @param {Request} request - Incoming HTTP request
 * @returns {string} Client IP address
 */
export function getClientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
