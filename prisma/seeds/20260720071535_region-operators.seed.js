/**
 * region-operators.seed.js — Usuarios de oficinas regionales (Dirección de Regiones).
 *
 * Datos: seed-data/20260720071535_region-operators.json
 * Uso:   node prisma/seed --only=20260720071535_region-operators
 */

exports.name = '20260720071535_region-operators'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  // Disabled for Caimanera: regional SIAC operators are not sports players and
  // would pollute the Player/Host/Manager dropdowns.
  log.info('⏭️  Oficinas regionales SIAC omitidas — no se crean usuarios (Caimanera).')
}
