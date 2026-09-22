/**
 * 20260810033845_update-call-statuses.seed.js
 *
 * Creado: 2026-08-10T07:38:45.720Z
 * Uso:    node prisma/seed --only=20260810033845_update-call-statuses
 */

exports.name = '20260810033845_update-call-statuses'

const { helpers } = require('./_runner')
const DATA_FILE = '20260810033845_update-call-statuses.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 update-call-statuses…')

  for (const item of data) {
    const isDeleted = item.deletedAt === 'NOW'
    await prisma.callStatus.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        closesCase: item.closesCase ?? false,
        caseStatusId: item.caseStatusId ?? null,
        ...(isDeleted ? { deletedAt: new Date() } : {}),
      },
      create: {
        id: item.id,
        name: item.name,
        closesCase: item.closesCase ?? false,
        caseStatusId: item.caseStatusId ?? null,
        ...(isDeleted ? { deletedAt: new Date() } : {}),
      },
    })
    log.success(`  ✓ id=${item.id}: "${item.name}" ${isDeleted ? '(soft-delete)' : ''}`)
  }

  log.success(`  ✓ update-call-statuses completado (${data.length} registros)`)
}
