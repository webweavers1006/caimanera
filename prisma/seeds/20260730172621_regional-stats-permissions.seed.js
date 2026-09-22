/**
 * 20260730172621_regional-stats-permissions.seed.js
 *
 * Registra el permiso regional_stats:view y lo asigna solo a ADMIN.
 */

exports.name = '20260730172621_regional-stats-permissions'

const { helpers } = require('./_runner')
const DATA_FILE = '20260730172621_regional-stats-permissions.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 regional-stats-permissions…')

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
  const perm = created['regional_stats:view']

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
    log.success(`  ✓ regional_stats:view → ${roleName}`)
  }

  log.success(`  ✓ regional-stats-permissions completado (${data.length} slugs)`)
}
