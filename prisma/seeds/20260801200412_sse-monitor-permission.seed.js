/**
 * 20260801200412_sse-monitor-permission.seed.js
 *
 * Creado: 2026-08-02T00:04:12.263Z
 * Uso:    node prisma/seed --only=20260801200412_sse-monitor-permission
 */

exports.name = '20260801200412_sse-monitor-permission'

const { helpers } = require('./_runner')
const DATA_FILE = '20260801200412_sse-monitor-permission.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 sse-monitor-permission…')

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
  const perm = created['sse_monitor:view']

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
    log.success(`  ✓ sse_monitor:view → ${roleName}`)
  }

  log.success(`  ✓ sse-monitor-permission completado (${data.length} slugs)`)
}
