/**
 * 20260810074520_add-pendiente-case-status.seed.js
 *
 * Creado: 2026-08-10T11:45:20.110Z
 * Uso:    node prisma/seed --only=20260810074520_add-pendiente-case-status
 */

exports.name = '20260810074520_add-pendiente-case-status'

const { helpers } = require('./_runner')
const DATA_FILE = '20260810074520_add-pendiente-case-status.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 add-pendiente-case-status…')

  // 1. Crear case status "PENDIENTE" (id=5, color naranja/ámbar)
  await prisma.caseStatus.upsert({
    where: { id: 5 },
    update: { name: 'PENDIENTE', color: '#f59e0b' },
    create: { id: 5, name: 'PENDIENTE', color: '#f59e0b' },
  })
  log.success('  ✓ CaseStatus id=5: "PENDIENTE" (#f59e0b)')

  // 2. Actualizar "Abierto" (id=1) → renombrar y cambiar color a gris (legacy)
  await prisma.caseStatus.update({
    where: { id: 1 },
    data: { name: 'ABIERTO (LEGACY)', color: '#9ca3af' },
  })
  log.success('  ✓ CaseStatus id=1: "ABIERTO (LEGACY)" — ya no se usa para nuevos casos')

  log.success(`  ✓ add-pendiente-case-status completado (${data.length} registros)`)
}
