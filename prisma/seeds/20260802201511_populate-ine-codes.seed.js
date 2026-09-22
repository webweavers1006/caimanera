/**
 * 20260802201511_populate-ine-codes.seed.js
 *
 * Popula los codigo_ine (pcode) en estados, municipios y parroquias
 * usando el matching nombre-a-nombre contra el dump SQL del sistema legacy.
 *
 * Uso:    node prisma/seed --only=20260802201511_populate-ine-codes
 *         node prisma/seed --only=20260802201511_populate-ine-codes --force
 */

exports.name = '20260802201511_populate-ine-codes'

const { helpers } = require('./_runner')
const DATA_FILE = '20260802201511_populate-ine-codes.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  const { states, municipalities, parishes, _counts } = data

  log.info(`📌 populate-ine-codes: ${_counts.states} estados, ${_counts.municipalities} municipios, ${_counts.parishes} parroquias\n`)

  // ── States ──
  let ok = 0
  for (const [id, pcode] of Object.entries(states)) {
    try {
      await prisma.state.updateMany({ where: { id: Number(id), pcode: null }, data: { pcode } })
      ok++
    } catch { /* skip if conflict */ }
  }
  log.success(`  ✓ ${ok} estados`)

  // ── Municipalities ──
  ok = 0
  for (const [id, pcode] of Object.entries(municipalities)) {
    try {
      const r = await prisma.municipality.updateMany({ where: { id: Number(id), pcode: null }, data: { pcode } })
      if (r.count > 0) ok++
    } catch { /* skip if pcode conflict */ }
  }
  log.success(`  ✓ ${ok} municipios`)

  // ── Parishes ──
  ok = 0
  for (const [id, pcode] of Object.entries(parishes)) {
    try {
      const r = await prisma.parish.updateMany({ where: { id: Number(id), pcode: null }, data: { pcode } })
      if (r.count > 0) ok++
    } catch { /* skip if pcode conflict */ }
  }
  log.success(`  ✓ ${ok} parroquias`)

  log.success(`\n✅ populate-ine-codes completado`)
}
