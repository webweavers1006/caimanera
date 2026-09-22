/**
 * 20260810030806_fix-closure-reasons-uppercase.seed.js
 *
 * Creado: 2026-08-10T07:08:06.002Z
 * Uso:    node prisma/seed --only=20260810030806_fix-closure-reasons-uppercase
 */

exports.name = '20260810030806_fix-closure-reasons-uppercase'

const { helpers } = require('./_runner')
const DATA_FILE = '20260810030806_fix-closure-reasons-uppercase.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 fix-closure-reasons-uppercase…')

  await helpers.upsertCatalog(prisma, 'closureReason', data, log, 'motivos de cierre')

  log.success(`  ✓ fix-closure-reasons-uppercase completado (${data.length} registros)`)
}
