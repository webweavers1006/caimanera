/**
 * directions.seed.js — Usuarios de dirección administrativa.
 *
 * Datos: seed-data/users-directions.json
 * Uso:   node prisma/seed --only=directions
 */

exports.name = '20260701000005_directions'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  // Disabled for Caimanera: SIAC direction users are not sports players and
  // would pollute the Player/Host/Manager dropdowns.
  log.info('⏭️  Usuarios de dirección SIAC omitidos — no se crean usuarios (Caimanera).')
}
