/**
 * 20260819010301_document-types.seed.js
 *
 * Creado: 2026-08-19T05:03:01.802Z
 * Uso:    node prisma/seed --only=20260819010301_document-types
 */

exports.name = '20260819010301_document-types'

const { helpers } = require('./_runner')
const PERMISSIONS_FILE = '20260819010301_document-types-permissions.json'
const DATA_FILE = '20260819010301_document-types.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  log.info('📌 document-types…')

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

  // 3. Upsert de tipos de documento — nombres en MAYÚSCULAS (convención del sistema).
  //    findFirst case-insensitive: renombra registros existentes y evita duplicados.
  const types = helpers.loadData(DATA_FILE)
  for (const item of types) {
    const existing = await prisma.documentType.findFirst({
      where: { name: { equals: item.name, mode: 'insensitive' } },
    })
    if (existing) {
      if (existing.name !== item.name) {
        await prisma.documentType.update({
          where: { id: existing.id },
          data: { name: item.name },
        })
        log.success(`  ✓ ${item.name} (renombrado)`)
      }
    } else {
      await prisma.documentType.create({ data: { name: item.name, isActive: true } })
      log.success(`  ✓ ${item.name} (creado)`)
    }
  }

  log.success(`  ✓ document-types completado (${permissions.length} permisos, ${types.length} tipos)`)
}
