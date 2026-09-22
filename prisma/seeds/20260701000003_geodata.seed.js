/**
 * geodata.seed.js — Códigos INE y polígonos GeoJSON.
 *
 * Datos: geo-data/ven_admbnda_adm3_ine_20210223.json
 * Uso:   node prisma/seed --only=geodata
 */

exports.name = '20260701000003_geodata'

const fs = require('node:fs')
const path = require('node:path')

function normalize(name) {
  if (!name) return ''
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]/g, '').trim().toLowerCase()
}

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const paths = [
    path.resolve(__dirname, '..', 'geo-data', 'ven_admbnda_adm3_ine_20210223.json'),
    '/tmp/mapavenezuela2024.github.io/create_json/ven_admbnda_adm3_ine_20210223.json',
  ]
  const file = paths.find(p => fs.existsSync(p))
  if (!file) return log.warn('⚠️  GeoJSON no encontrado. Omitiendo.')

  log.info(`🌎 Códigos INE + polígonos: ${file}`)
  const geojson = JSON.parse(fs.readFileSync(file, 'utf-8'))
  const features = geojson.features || []

  // Unique states & municipalities
  const stMap = new Map(), muMap = new Map()
  for (const f of features) {
    const p = f.properties
    if (!stMap.has(p.ADM1_PCODE)) stMap.set(p.ADM1_PCODE, { pcode: p.ADM1_PCODE, name: p.ADM1_ES })
    if (!muMap.has(p.ADM2_PCODE)) muMap.set(p.ADM2_PCODE, { pcode: p.ADM2_PCODE, name: p.ADM2_ES })
  }

  // DB lookups
  const dbSt = await prisma.state.findMany({ where: { deletedAt: null }, select: { id: true, name: true } })
  const stByName = new Map(dbSt.map(s => [normalize(s.name), s]))
  const dbMu = await prisma.municipality.findMany({ where: { deletedAt: null }, select: { id: true, name: true, stateId: true } })
  const muByName = new Map(dbMu.map(m => [normalize(m.name), m]))
  const dbPa = await prisma.parish.findMany({ where: { deletedAt: null }, select: { id: true, name: true, municipalityId: true } })
  const paByName = new Map(dbPa.map(p => [normalize(p.name), p]))

  const update = async (model, id, data) => {
    try { await prisma[model].update({ where: { id }, data }) }
    catch (e) { if (e.code !== 'P2002') throw e }
  }

  // States
  let ok = 0
  for (const [, ine] of stMap) {
    const db = stByName.get(normalize(ine.name)); if (!db) continue
    await update('state', db.id, { pcode: ine.pcode }); ok++
  }
  log.info(`   ✅ Estados: ${ok}/${stMap.size}`)

  // Municipalities
  ok = 0
  for (const [, ine] of muMap) {
    const db = muByName.get(normalize(ine.name)); if (!db) continue
    await update('municipality', db.id, { pcode: ine.pcode }); ok++
  }
  log.info(`   ✅ Municipios: ${ok}/${muMap.size}`)

  // Parishes
  ok = 0; let geo = 0
  for (const f of features) {
    const p = f.properties
    let t = paByName.get(normalize(p.ADM3_ES)); if (!t) continue
    const mu = muByName.get(normalize(p.ADM2_ES))
    if (mu && t.municipalityId !== mu.id) {
      const alt = await prisma.parish.findFirst({
        where: { name: p.ADM3_ES, municipalityId: mu.id, deletedAt: null },
      })
      if (alt) t = alt
    }
    await update('parish', t.id, { pcode: p.ADM3_PCODE, geoData: f.geometry })
    ok++; geo++
  }
  log.info(`   ✅ Parroquias: ${ok}/${features.length} (${geo} polígonos)`)
}
