import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { logger } from '@/features/shared/lib/logger'

const connectionString = process.env.DATABASE_URL

/**
 * Connection pool sizing notes:
 * - max: 50 per process. Postgres default max_connections is 100 — safe for a
 *   single PM2 worker. If scaling to multiple workers, add PgBouncer BEFORE
 *   raising this, otherwise you can exhaust Postgres connections.
 * - connectionTimeoutMillis: fail fast (3s) instead of hanging a request 10s
 *   when the pool is saturated.
 */
const MAX_POOL_SIZE = 50

const pool = new Pool({
  connectionString,
  max: MAX_POOL_SIZE,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
})
const adapter = new PrismaPg(pool)

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

const globalForPrisma = global

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ── Pool monitoring ──────────────────────────────────────────────────
// Periodic snapshot of pool usage so saturation (waitingCount > 0) is
// visible in production logs before it becomes user-facing slowness.
// Warns by default (LOG_LEVEL=warn); full snapshots appear with LOG_LEVEL=info.
if (process.env.NODE_ENV === 'production' && !globalForPrisma.poolMonitorStarted) {
  globalForPrisma.poolMonitorStarted = true
  const POOL_STATS_INTERVAL_MS = 60_000

  const timer = setInterval(() => {
    const { totalCount, idleCount, waitingCount } = pool
    const stats = {
      active: totalCount - idleCount,
      idle: idleCount,
      total: totalCount,
      waiting: waitingCount,
      max: MAX_POOL_SIZE,
    }

    if (waitingCount > 0) {
      logger.warn('Prisma pool: requests waiting for a connection', stats)
    } else {
      logger.info('Prisma pool stats', stats)
    }
  }, POOL_STATS_INTERVAL_MS)
  timer.unref?.()
}

export default prisma
