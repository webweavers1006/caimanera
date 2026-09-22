/**
 * 20260719022616_permisos-module.seed.js
 *
 * Creado: 2026-07-19T06:26:16.292Z
 * Uso:    node prisma/seed --only=20260719022616_permisos-module
 */

exports.name = '20260719022616_permisos-module'

const { helpers } = require('./_runner')
const DATA_FILE = '20260719022616_permisos-module.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 permisos-module…')

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

  // Assign to ADMIN role
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
  }

  log.success(`  ✓ permisos-module completado (${data.length} slugs)`)
}
