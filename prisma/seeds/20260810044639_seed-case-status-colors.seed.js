/**
 * 20260810044639_seed-case-status-colors.seed.js
 *
 * Creado: 2026-08-10T08:46:39.179Z
 * Uso:    node prisma/seed --only=20260810044639_seed-case-status-colors
 */

exports.name = '20260810044639_seed-case-status-colors'

const { helpers } = require('./_runner')
const DATA_FILE = '20260810044639_seed-case-status-colors.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 seed-case-status-colors…')

  for (const item of data) {
    await prisma.caseStatus.update({
      where: { id: item.id },
      data: { color: item.color },
    })
    log.success(`  ✓ id=${item.id}: "${item.name}" → ${item.color}`)
  }

  log.success(`  ✓ seed-case-status-colors completado (${data.length} registros)`)
}
