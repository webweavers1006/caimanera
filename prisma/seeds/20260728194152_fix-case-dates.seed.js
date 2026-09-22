/**
 * 20260728194152_fix-case-dates.seed.js
 *
 * Creado: 2026-07-28T23:41:52.742Z
 * Uso:    node prisma/seed --only=20260728194152_fix-case-dates
 *
 * Repara fechas de casos que retrocedieron 1 día por cada edición
 * debido al bug en toDateInput (zona horaria Venezuela vs UTC).
 *
 * Lógica: compara caseDate (@db.Date) con createdAt (@db.Timestamptz)
 * y corrige caseDate = fecha de creación (hora Venezuela).
 */

exports.name = '20260728194152_fix-case-dates'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  log.info('📌 Verificando fechas de casos…')

  // 1. Encontrar casos con fecha corrida
  const cases = await prisma.case.findMany({
    where: { deletedAt: null, caseDate: { not: null } },
    select: { id: true, caseDate: true, createdAt: true },
    orderBy: { id: 'asc' },
  })

  const shifted = cases.filter((c) => {
    const caseDateStr = c.caseDate.toISOString().slice(0, 10)
    const createdDateStr = c.createdAt.toISOString().slice(0, 10)
    return caseDateStr !== createdDateStr
  })

  log.info(`   Total casos: ${cases.length}`)
  log.info(`   Casos con fecha corrida: ${shifted.length}`)

  if (shifted.length === 0) {
    log.success('   ✅ Todas las fechas están correctas.')
    return
  }

  // 2. Mostrar algunos ejemplos
  log.warn(`   ⚠️  ${shifted.length} casos necesitan reparación:`)
  for (const c of shifted.slice(0, 5)) {
    const ve = new Date(c.createdAt.getTime() - 4 * 60 * 60 * 1000)
    const nuevaFecha = ve.toISOString().slice(0, 10)
    log.warn(`      ID ${c.id}: ${c.caseDate.toISOString().slice(0, 10)} → ${nuevaFecha}`)
  }
  if (shifted.length > 5) {
    log.warn(`      ... y ${shifted.length - 5} más`)
  }

  // 3. Reparar
  let fixed = 0
  for (const c of shifted) {
    // Fecha de creación en Venezuela (UTC-4)
    const ve = new Date(c.createdAt.getTime() - 4 * 60 * 60 * 1000)
    const newDateStr = ve.toISOString().slice(0, 10)
    // Construir Date a medianoche Caracas para @db.Date
    const newDate = new Date(`${newDateStr}T00:00:00-04:00`)

    await prisma.case.update({
      where: { id: c.id },
      data: { caseDate: newDate },
    })
    fixed++
  }

  log.success(`   ✅ ${fixed} casos reparados.`)

  // 4. Verificar
  const stillShifted = await prisma.case.count({
    where: { deletedAt: null, caseDate: { not: null } },
  })
  log.success(`   Total casos después de reparación: ${stillShifted}`)
}
