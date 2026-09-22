/**
 * 20260810040501_fix-call-statuses-cerrado-id2.seed.js
 *
 * Creado: 2026-08-10T08:05:01.207Z
 * Uso:    node prisma/seed --only=20260810040501_fix-call-statuses-cerrado-id2
 */

exports.name = '20260810040501_fix-call-statuses-cerrado-id2'

const { helpers } = require('./_runner')
const DATA_FILE = '20260810040501_fix-call-statuses-cerrado-id2.json'

/**
 * Swap: id=2 hereda el rol de "cierre" (era "Atendido" históricamente).
 * id=5 pasa a ser el nuevo "contacto sin cierre".
 *
 * Esto preserva que todos los seguimientos históricos con callStatusId=2
 * (antes "Atendido") ahora se muestren como "CERRADO".
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 fix-call-statuses-cerrado-id2…')

  for (const item of data) {
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
    log.success(`  ✓ id=${item.id}: "${item.name}" (caseStatusId=${item.caseStatusId ?? 'null'})`)
  }

  log.success(`  ✓ fix-call-statuses-cerrado-id2 completado (${data.length} registros)`)
}
