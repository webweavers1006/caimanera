/**
 * 20260722094926_nuevos-region-operators.seed.js — Nuevos operadores de oficinas regionales.
 *
 * Datos: seed-data/20260722094926_nuevos-region-operators.json
 * Uso:   node prisma/seed --only=20260722094926_nuevos-region-operators
 *
 * Extiende el set original (20260720071535_region-operators) con oficinas
 * adicionales del catálogo SAIME que no tenían operador asignado.
 * Asigna automáticamente el officeId buscando la oficina por su código (OFxxx).
 */

exports.name = '20260722094926_nuevos-region-operators'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  // Disabled for Caimanera: regional SIAC operators are not sports players and
  // would pollute the Player/Host/Manager dropdowns.
  log.info('⏭️  Nuevos operadores regionales SIAC omitidos — no se crean usuarios (Caimanera).')
}
