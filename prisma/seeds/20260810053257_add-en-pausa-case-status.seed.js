/**
 * 20260810053257_add-en-pausa-case-status.seed.js
 *
 * Creado: 2026-08-10T09:32:57.651Z
 * Uso:    node prisma/seed --only=20260810053257_add-en-pausa-case-status
 */

exports.name = '20260810053257_add-en-pausa-case-status'

const { helpers } = require('./_runner')
const DATA_FILE = '20260810053257_add-en-pausa-case-status.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 add-en-pausa-case-status…')

  // 1. Crear case status "EN PAUSA" (id=4, color púrpura)
  await prisma.caseStatus.upsert({
    where: { id: 4 },
    update: { name: 'EN PAUSA', color: '#a855f7' },
    create: { id: 4, name: 'EN PAUSA', color: '#a855f7' },
  })
  log.success('  ✓ CaseStatus id=4: "EN PAUSA" (#a855f7)')

  // 2. Actualizar EN ESPERA (id=6) → caseStatusId=4 (En Pausa)
  await prisma.callStatus.update({
    where: { id: 6 },
    data: { caseStatusId: 4 },
  })
  log.success('  ✓ CallStatus id=6 "EN ESPERA" → caseStatusId=4 (En Pausa)')

  log.success('  ✓ add-en-pausa-case-status completado')
}
