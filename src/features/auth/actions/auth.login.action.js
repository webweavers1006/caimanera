'use server'

import { headers } from 'next/headers'
import { loginSchema } from '../schemas/login.schema'
import { authenticateUser, loginUserSession } from '../services/auth.service'
import { loginRateLimiter } from '../lib/rate-limiter'
import { AUTH_CONFIG } from '../config/auth.constants'
import { createAuditEntry } from '@/features/audit-logs/services/audit-log.write.service'
import { logger } from '@/features/shared'

/**
 * Extracts the client IP address from request headers.
 * Checks common proxy/CDN headers with fallback.
 *
 * @returns {Promise<string>} Client IP address.
 */
async function getClientIp() {
  const headersList = await headers()
  return (
    headersList.get(AUTH_CONFIG.RATE_LIMIT.HEADERS.CLIENT_IP)?.split(',')[0]?.trim() ||
    headersList.get(AUTH_CONFIG.RATE_LIMIT.HEADERS.REAL_IP) ||
    'unknown'
  )
}

/**
 * Server Action for user login.
 * Protected by rate limiting — max 5 attempts per IP in 15 minutes.
 *
 * NOTE — documented exception to the action factory rule (§6 RBAC):
 * login cannot use createProtectedAction/createAuthenticatedFunction because
 * there is no session yet (pre-auth). CSRF is covered by Next.js built-in
 * server-action origin check; brute force by the IP rate limiter above.
 *
 * @param {any} prevState - Previous state from useActionState.
 * @param {FormData} formData - Form data.
 */
export async function loginAction(prevState, formData) {
  // 1. Rate limit check — blocks before any processing
  const ip = await getClientIp()
  const { allowed } = loginRateLimiter.checkLimit(ip)

  if (!allowed) {
    return { error: AUTH_CONFIG.ERRORS.RATE_LIMITED }
  }

  // 2. Schema validation
  const result = loginSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { error: 'Datos inválidos', details: result.error.flatten().fieldErrors }
  }

  const { email, password } = result.data

  // 3. Authenticate
  const authResult = await authenticateUser(email, password);

  if (!authResult.success) {
    return { error: authResult.error }
  }

  // 4. Create session
  await loginUserSession(authResult.user);

  // Reset rate limit on successful login
  loginRateLimiter.resetLimit(ip);

  // 5. Audit log — fire and forget
  createAuditEntry({
    userId: authResult.user.id,
    action: 'Inicio de sesión exitoso',
  }).catch(err => logger.error('Audit log failed for login', { userId: authResult.user.id, error: err.message }));

  return { success: true }
}
