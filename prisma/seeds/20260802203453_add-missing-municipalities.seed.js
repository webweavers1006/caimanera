/**
 * 20260802203453_add-missing-municipalities.seed.js
 *
 * Agrega 15 municipios venezolanos faltantes en el catálogo.
 * Datos extraídos del dump SQL del sistema legacy (SGC).
 *
 * Uso:    node prisma/seed --only=20260802203453_add-missing-municipalities
 */

exports.name = '20260802203453_add-missing-municipalities'

const { helpers } = require('./_runner')
const DATA_FILE = '20260802203453_add-missing-municipalities.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info(`📌 Agregando ${data.length} municipios faltantes…\n`)

  // Sincronizar secuencia tras inserts con IDs explícitos (populate-ine-codes)
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('municipios','id'), (SELECT MAX(id) FROM municipios))`
  )

  for (const item of data) {
    const state = await prisma.state.findUnique({ where: { id: item.stateId, deletedAt: null } })
    if (!state) {
      log.warn(`  ⚠️  Estado id=${item.stateId} no encontrado: ${item.name}`)
      continue
    }

    const exists = await prisma.municipality.findUnique({ where: { pcode: item.pcode } })
    if (exists) {
      log.info(`  ⏭️  Ya existe: ${exists.name} (pcode=${item.pcode})`)
      continue
    }

    await prisma.municipality.create({
      data: { name: item.name, pcode: item.pcode, stateId: item.stateId },
    })
    log.success(`  ✓ ${item.name} (${state.name}, INE: ${item.pcode})`)
  }

  log.success(`\n✅ ${data.length} municipios procesados.`)
}
