/**
 * 20260810041437_add-en-proceso-y-en-espera.seed.js
 *
 * Creado: 2026-08-10T08:14:37.337Z
 * Uso:    node prisma/seed --only=20260810041437_add-en-proceso-y-en-espera
 */

exports.name = '20260810041437_add-en-proceso-y-en-espera'

const { helpers } = require('./_runner')
const CASE_STATUS_FILE = '20260810041437_case-statuses-en-proceso.json'
const CALL_STATUS_FILE = '20260810041437_call-statuses-en-proceso.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  log.info('📌 add-en-proceso-y-en-espera…')

  // 1. Crear case status "En Proceso" (id=3)
  const caseStatuses = helpers.loadData(CASE_STATUS_FILE)
  await helpers.upsertCatalog(prisma, 'caseStatus', caseStatuses, log, 'estatus de caso')

  // 2. Crear/actualizar call statuses (CONTACTADO con caseStatusId=3, EN ESPERA nuevo)
  const callStatuses = helpers.loadData(CALL_STATUS_FILE)
  for (const item of callStatuses) {
    await prisma.callStatus.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        closesCase: item.closesCase ?? false,
        caseStatusId: item.caseStatusId ?? null,
      },
      create: {
        id: item.id,
        name: item.name,
        closesCase: item.closesCase ?? false,
        caseStatusId: item.caseStatusId ?? null,
      },
    })
    log.success(`  ✓ CallStatus id=${item.id}: "${item.name}" (caseStatusId=${item.caseStatusId ?? 'null'})`)
  }

  log.success('  ✓ add-en-proceso-y-en-espera completado')
}
