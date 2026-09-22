/**
 * 20260825123757_delivery-types.seed.js
 *
 * Creado: 2026-08-25T16:37:57.930Z
 * Uso:    node prisma/seed --only=20260825123757_delivery-types
 */

exports.name = '20260825123757_delivery-types'

const { helpers } = require('./_runner')
const PERMISSIONS_FILE = '20260825123757_delivery-types-permissions.json'
const DATA_FILE = '20260825123757_delivery-types.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  log.info('📌 delivery-types…')

  // 1. Upsert de cada permiso
  const permissions = helpers.loadData(PERMISSIONS_FILE)
  const created = {}
  for (const p of permissions) {
    const r = await prisma.permission.upsert({
      where: { slug: p.slug },
      update: { description: p.description },
      create: p,
    })
    created[p.slug] = r
    log.success(`  ✓ ${r.slug}`)
  }

  // 2. Asignar todos a ADMIN
  const admin = await prisma.role.findUnique({ where: { name: 'ADMIN' } })
  if (admin) {
    let n = 0
    for (const p of Object.values(created)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: admin.id, permissionId: p.id } },
        update: {},
        create: { roleId: admin.id, permissionId: p.id },
      })
      n++
    }
    log.success(`  ✓ ${n} permisos → ADMIN`)
  } else {
    log.warn('  ⚠️  Rol ADMIN no encontrado — permisos creados pero no asignados')
  }

  // 3. Upsert de tipos de entrega — case-insensitive, sin duplicados
  const types = helpers.loadData(DATA_FILE)
  for (const item of types) {
    const existing = await prisma.deliveryType.findFirst({
      where: { name: { equals: item.name, mode: 'insensitive' } },
    })
    if (existing) {
      if (existing.name !== item.name) {
        await prisma.deliveryType.update({
          where: { id: existing.id },
          data: { name: item.name },
        })
        log.success(`  ✓ ${item.name} (renombrado)`)
      }
    } else {
      await prisma.deliveryType.create({ data: { name: item.name, isActive: true } })
      log.success(`  ✓ ${item.name} (creado)`)
    }
  }

  // 4. Tipos de documento válidos por tipo de entrega (prelación)
  const TYPE_DOCUMENT_LINKS = {
    'CONSULARES': ['PASAPORTE', 'VISADO'],
    'DESVÍOS': ['PASAPORTE'],
    'ANTONIO JOSÉ DE SUCRE': ['PASAPORTE'],
    'VISAS': ['VISADO'],
  }
  for (const [typeName, documentNames] of Object.entries(TYPE_DOCUMENT_LINKS)) {
    const deliveryType = await prisma.deliveryType.findFirst({ where: { name: typeName } })
    if (!deliveryType) {
      log.warn(`  ⚠️  ${typeName} no encontrado — vínculos omitidos`)
      continue
    }
    const documentTypes = await prisma.documentType.findMany({
      where: { name: { in: documentNames }, deletedAt: null },
    })
    for (const documentType of documentTypes) {
      await prisma.deliveryTypeDocumentType.upsert({
        where: {
          deliveryTypeId_documentTypeId: {
            deliveryTypeId: deliveryType.id,
            documentTypeId: documentType.id,
          },
        },
        update: {},
        create: { deliveryTypeId: deliveryType.id, documentTypeId: documentType.id },
      })
    }
    log.success(`  ✓ ${typeName} → ${documentTypes.map((d) => d.name).join(', ') || '—'}`)
  }

  log.success(`  ✓ delivery-types completado (${permissions.length} permisos, ${types.length} tipos)`)
}
