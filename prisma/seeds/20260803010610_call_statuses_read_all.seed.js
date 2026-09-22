/**
 * 20260803010610_call_statuses_read_all.seed.js
 *
 * Creado: 2026-08-03T05:06:10.655Z
 * Uso:    node prisma/seed --only=20260803010610_call_statuses_read_all
 */

exports.name = '20260803010610_call_statuses_read_all'

const { helpers } = require('./_runner')
const DATA_FILE = '20260803010610_call_statuses_read_all.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 call_statuses:read_all…')

  // Upsert permission
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

  // Assign to ADMIN role only
  const targetRoles = ['ADMIN']
  const perm = created['call_statuses:read_all']

  for (const roleName of targetRoles) {
    const role = await prisma.role.findUnique({ where: { name: roleName } })
    if (!role) {
      log.warn(`  ⚠️  Rol ${roleName} no encontrado — omitido`)
      continue
    }
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
      update: {},
      create: { roleId: role.id, permissionId: perm.id },
    })
    log.success(`  ✓ call_statuses:read_all → ${roleName}`)
  }
}
