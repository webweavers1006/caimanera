/**
 * geography.seed.js — Estados, municipios, parroquias y oficinas.
 *
 * Datos: seed-data/states.json, municipalities.json, parishes.json, offices.json
 * Uso:   node prisma/seed --only=geography
 */

exports.name = '20260701000002_geography'

const { helpers } = require('./_runner')

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  log.info('📌 Geografía…\n')

  const states = helpers.loadData('states.json')
  for (const s of states) {
    await prisma.state.upsert({
      where: { id: s.id }, update: { name: s.name, countryId: s.countryId }, create: s,
    })
  }
  log.success(`  ✓ ${states.length} estados`)

  const munis = helpers.loadData('municipalities.json')
  for (const m of munis) {
    await prisma.municipality.upsert({
      where: { id: m.id }, update: { name: m.name, stateId: m.stateId }, create: m,
    })
  }
  log.success(`  ✓ ${munis.length} municipios`)

  const parishes = helpers.loadData('parishes.json')
  for (const p of parishes) {
    await prisma.parish.upsert({
      where: { id: p.id }, update: { name: p.name, municipalityId: p.municipalityId }, create: p,
    })
  }
  log.success(`  ✓ ${parishes.length} parroquias`)

  // Offices — moved from catalogs.seed.js: offices reference stateId, so they
  // must run after states are created in this same seeder.
  {
    const offices = helpers.loadData('offices.json')
    let nc = 0
    for (const item of offices) {
      const code = item.code || `NC${String(++nc).padStart(2, '0')}`
      const { lastUpdatedAt, ...rest } = item
      await prisma.office.upsert({
        where: { code },
        update: { name: item.name, address: item.address, stateId: item.stateId },
        create: { ...rest, code },
      })
    }
    log.success(`  ✓ ${offices.length} oficinas`)
  }
}
