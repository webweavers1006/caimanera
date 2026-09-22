/**
 * 20260901073626_delivery-read-all.seed.js
 *
 * Agrega el permiso delivery:read_all (ver todas las entregas sin scope
 * jerárquico) y lo asigna al rol ADMIN.
 *
 * Creado: 2026-09-01
 * Uso:    node prisma/seed --only=20260901073626_delivery-read-all
 */

exports.name = '20260901073626_delivery-read-all'

const { helpers } = require('./_runner')
const DATA_FILE = '20260901073626_delivery-read-all.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 delivery-read-all…')

  // Upsert each permission
  const created = {}
  for (const p of data) {
    const r = await prisma.permission.upsert({
      where: { slug: p.slug },
      update: { description: p.description },
      create: p,
    })
    created[p.slug] = r
    log.success(`  ✓ ${r.slug}`)
  }

  // Assign all to ADMIN
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
}
