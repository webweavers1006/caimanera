import { PageHeader } from '@/components/shared/PageHeader'
import { ErrorAlert } from '@/components/shared/ErrorAlert'
import { logger } from '@/features/shared'
import { AUTH_CONFIG } from '../config/auth.constants'
import { fetchBlockedLoginIps, fetchLoginLimiterStats } from '../services/login-locks.read.service'
import { LoginLocksTableView } from './LoginLocksTableView'

const { UI } = AUTH_CONFIG.LOGIN_LOCKS
const { LABELS } = UI

// Server-side date formatting avoids hydration mismatches in the client table.
const RESET_TIME_FORMATTER = new Intl.DateTimeFormat('es-VE', {
  dateStyle: 'short',
  timeStyle: 'medium',
  timeZone: 'America/Caracas',
})

/**
 * LoginLocksPageContainer — Server Component.
 *
 * Fetches blocked IPs via the read service and passes them to the client
 * view. Page-level access control lives in the thin page
 * (`checkPageAccess` with permission `auth:unlock`).
 */
export async function LoginLocksPageContainer() {
  let blocks = []
  let stats = null
  let loadError = null

  try {
    blocks = fetchBlockedLoginIps().map((entry) => ({
      ip: entry.ip,
      attempts: entry.attempts,
      resetTimeLabel: RESET_TIME_FORMATTER.format(entry.resetTime),
    }))
    stats = fetchLoginLimiterStats()
  } catch (error) {
    logger.error('Failed to load login locks', { error: error.message })
    loadError = LABELS.ERROR
  }

  if (loadError) {
    return <ErrorAlert message={loadError} />
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={AUTH_CONFIG.LOGIN_LOCKS.TITLE}
        subtitle={AUTH_CONFIG.LOGIN_LOCKS.DESCRIPTION}
        showNav={false}
      />
      <LoginLocksTableView initialBlocks={blocks} stats={stats} />
    </div>
  )
}
