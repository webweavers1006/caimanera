/**
 * permissions.seed.js — Slugs del módulo de permisos + asignación a ADMIN.
 *
 * Datos: seed-data/permissions.json (filtra los del módulo)
 * Uso:   node prisma/seed --only=permissions
 */

exports.name = '20260701000006_permissions'

const { helpers } = require('./_runner')

const MODULE_SLUGS = ['permissions:view', 'permissions:read', 'permissions:create', 'permissions:update', 'permissions:delete']

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const all = helpers.loadData('permissions.json')
  const mine = all.filter(p => MODULE_SLUGS.includes(p.slug))

  log.info('📌 Permisos del módulo…')
  const created = {}
  for (const p of mine) {
    const r = await prisma.permission.upsert({
      where: { slug: p.slug }, update: { description: p.description }, create: p,
    })
    created[p.slug] = r
    log.success(`  ✓ ${r.slug}`)
  }

  const admin = await prisma.role.findUnique({ where: { name: 'ADMIN' } })
  if (admin) {
    let n = 0
    for (const p of Object.values(created)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: admin.id, permissionId: p.id } },
        update: {}, create: { roleId: admin.id, permissionId: p.id },
      })
      n++
    }
    log.success(`  ✓ ${n} permisos → ADMIN`)
  }
}
