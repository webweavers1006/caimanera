/**
 * operators.seed.js — Usuarios operadores OATC.
 *
 * Datos: seed-data/users-operators.json
 * Uso:   node prisma/seed --only=operators
 */

exports.name = '20260701000004_operators'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  // Disabled for Caimanera: SIAC operators are not sports players and would
  // pollute the Player/Host/Manager dropdowns.
  log.info('⏭️  Operadores SIAC omitidos — no se crean usuarios (Caimanera).')
}
