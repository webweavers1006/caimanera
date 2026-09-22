/**
 * catalogs.seed.js — Catálogos base y trámites.
 *
 * Datos: seed-data/*.json
 * Uso:   node prisma/seed --only=catalogs
 */

exports.name = '20260701000001_catalogs'

const { helpers } = require('./_runner')

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  log.info('📌 Catálogos base…\n')
  const { upsertCatalog, loadData } = helpers

  await upsertCatalog(prisma, 'country', loadData('countries.json'), log, 'países')
  await upsertCatalog(prisma, 'caseStatus', loadData('case-statuses.json'), log, 'estatus')
  await upsertCatalog(prisma, 'attentionChannel', loadData('attention-channels.json'), log, 'canales')
  await upsertCatalog(prisma, 'attachedEntity', loadData('attached-entities.json'), log, 'entes')
  await upsertCatalog(prisma, 'popularOrganization', loadData('popular-organizations.json'), log, 'org. populares')
  await upsertCatalog(prisma, 'caseArea', loadData('case-areas.json'), log, 'áreas')
  await upsertCatalog(prisma, 'callStatus', loadData('call-statuses.json'), log, 'estatus llamada')
  await upsertCatalog(prisma, 'beneficiaryType', loadData('beneficiary-types.json'), log, 'tipos benef.')
  await upsertCatalog(prisma, 'reason', loadData('reasons.json'), log, 'motivos')
  await upsertCatalog(prisma, 'attentionType', loadData('attention-types.json'), log, 'tipos atención')
  await upsertCatalog(prisma, 'attentionTypeDetail', loadData('attention-type-details.json'), log, 'detalles')
  await upsertCatalog(prisma, 'administrativeDirection', loadData('administrative-directions.json'), log, 'direcciones')

  // Direction-Area M2M
 /*  {
    const data = loadData('direction-areas.json')
    for (const item of data) {
      await prisma.directionArea.upsert({
        where: { directionId_areaId: { directionId: item.directionId, areaId: item.areaId } },
        update: {}, create: item,
      })
    }
    log.success(`  ✓ ${data.length} relaciones dirección-área`)
  } */

  // Procedures
  {
    const data = loadData('procedures.json')
    let created = 0
    for (const item of data) {
      const existing = await prisma.procedure.findFirst({
        where: { name: item.name, deletedAt: null },
      })
      if (existing) {
        await prisma.procedure.update({
          where: { id: existing.id },
          data: { administrativeDirectionId: item.administrativeDirectionId, requirements: item.requirements },
        })
      } else {
        await prisma.procedure.create({ data: item })
        created++
      }
    }
    log.success(`  ✓ ${data.length} trámites (${created} nuevos)`)
  }
}
