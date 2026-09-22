/**
 * 20260802204242_add-missing-parishes.seed.js
 *
 * Agrega ~198 parroquias venezolanas faltantes en el catálogo.
 * Datos extraídos del dump SQL del sistema legacy (SGC).
 * Requiere que add-missing-municipalities se ejecute primero.
 *
 * Uso:    node prisma/seed --only=20260802204242_add-missing-parishes
 */

exports.name = '20260802204242_add-missing-parishes'

const { helpers } = require('./_runner')
const DATA_FILE = '20260802204242_add-missing-parishes.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info(`📌 Agregando ${data.length} parroquias faltantes…\n`)

  // Sincronizar secuencia tras inserts con IDs explícitos (populate-ine-codes)
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('parroquias','id'), (SELECT MAX(id) FROM parroquias))`
  )

  let added = 0
  let skipped = 0

  for (const item of data) {
    // Verify municipality exists
    const muni = await prisma.municipality.findUnique({
      where: { id: item.municipalityId, deletedAt: null },
    })
    if (!muni) {
      log.warn(`  ⚠️  Municipio id=${item.municipalityId} no encontrado: ${item.name}`)
      continue
    }

    // Check if parish already exists by pcode (unique)
    const exists = await prisma.parish.findUnique({ where: { pcode: item.pcode } })
    if (exists) {
      skipped++
      continue
    }

    await prisma.parish.create({
      data: {
        name: item.name,
        pcode: item.pcode,
        municipalityId: item.municipalityId,
      },
    })
    added++
  }

  log.success(`  ✓ ${added} parroquias agregadas, ${skipped} ya existían`)
  log.success(`\n✅ add-missing-parishes completado.`)
}
