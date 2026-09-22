import { unlockLoginIp } from '../lib/rate-limiter'
import { createAuditEntry } from '@/features/audit-logs/services/audit-log.write.service'
import { logger } from '@/features/shared'

/**
 * Write service for the login-locks admin panel.
 *
 * Unlocks a blocked IP and registers the admin action in the audit log
 * (fire-and-forget — never blocks the main operation).
 *
 * @param {Object} data - { ip: string }
 * @param {Object} session - Current user session.
 * @returns {Promise<{ success: boolean, unlocked: boolean }>}
 */
export async function unlockBlockedLoginIp({ ip }, session) {
  const unlocked = unlockLoginIp(ip)

  // Audit log — fire and forget (the IP is the subject of the admin action)
  createAuditEntry({
    userId: session.id,
    action: `Desbloqueo de IP en límite de intentos de login: ${ip}`,
  }).catch((err) =>
    logger.error('Audit log failed for login unlock', {
      userId: session.id,
      error: err.message,
    })
  )

  return { success: true, unlocked }
}
