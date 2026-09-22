/**
 * 20260810033845_add-sin-contacto-closure-reason.seed.js
 *
 * Creado: 2026-08-10T07:38:45.776Z
 * Uso:    node prisma/seed --only=20260810033845_add-sin-contacto-closure-reason
 */

exports.name = '20260810033845_add-sin-contacto-closure-reason'

const { helpers } = require('./_runner')
const DATA_FILE = '20260810033845_add-sin-contacto-closure-reason.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 add-sin-contacto-closure-reason…')

  await helpers.upsertCatalog(prisma, 'closureReason', data, log, 'motivos de cierre')

  log.success(`  ✓ add-sin-contacto-closure-reason completado (${data.length} registro)`)
}
