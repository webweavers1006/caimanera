/**
 * 20260810043718_enable-closure-flags-on-cerrado.seed.js
 *
 * Creado: 2026-08-10T08:37:18.421Z
 * Uso:    node prisma/seed --only=20260810043718_enable-closure-flags-on-cerrado
 */

exports.name = '20260810043718_enable-closure-flags-on-cerrado'

const { helpers } = require('./_runner')
const DATA_FILE = '20260810043718_enable-closure-flags-on-cerrado.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 enable-closure-flags-on-cerrado…')

  for (const item of data) {
    await prisma.callStatus.update({
      where: { id: item.id },
      data: {
        requiresReason: item.requiresReason ?? false,
        requiresCitizenMessage: item.requiresCitizenMessage ?? false,
      },
    })
    log.success(`  ✓ id=${item.id}: requiresReason=${item.requiresReason}, requiresCitizenMessage=${item.requiresCitizenMessage}`)
  }

  log.success(`  ✓ enable-closure-flags-on-cerrado completado (${data.length} registros)`)
}
