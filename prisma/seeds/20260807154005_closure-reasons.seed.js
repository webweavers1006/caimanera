/**
 * 20260807154005_closure-reasons.seed.js
 *
 * Creado: 2026-08-07T19:40:05.961Z
 * Uso:    node prisma/seed --only=20260807154005_closure-reasons
 */

exports.name = '20260807154005_closure-reasons'

const { helpers } = require('./_runner')
const DATA_FILE = '20260807154005_closure-reasons.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 closure-reasons…')

  await helpers.upsertCatalog(prisma, 'closureReason', data, log, 'motivos de cierre')

  log.success(`  ✓ closure-reasons completado (${data.length} registros)`)
}
