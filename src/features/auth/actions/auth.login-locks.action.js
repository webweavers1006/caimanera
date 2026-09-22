'use server'

import { createProtectedAction } from '@/features/shared/lib/safe-action'
import { AUTH_CONFIG } from '../config/auth.constants'
import { unlockLoginIpSchema } from '../schemas/login-locks.schema'
import { unlockBlockedLoginIp } from '../services/login-locks.write.service'

/**
 * Admin action: unlocks an IP blocked by the login rate limiter.
 * Requires permission `auth:unlock` (RBAC) + CSRF + session + Zod validation.
 * Business logic lives in services/login-locks.write.service.js.
 */
export const unlockLoginIpAction = createProtectedAction(
  AUTH_CONFIG.PERMISSIONS.LOGIN_UNLOCK,
  unlockLoginIpSchema,
  unlockBlockedLoginIp
)
