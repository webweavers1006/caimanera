/**
 * 20260728134753_case-stats-permission.seed.js
 *
 * Creado: 2026-07-28T17:47:53.418Z
 * Uso:    node prisma/seed --only=20260728134753_case-stats-permission
 *
 * Registra el permiso case_stats:view y lo asigna a ADMIN, OPERADOR y DIRECCION.
 */

exports.name = '20260728134753_case-stats-permission'

const { helpers } = require('./_runner')
const DATA_FILE = '20260728134753_case-stats-permission.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 case-stats-permission…')

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
  const perm = created['case_stats:view']

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
    log.success(`  ✓ case_stats:view → ${roleName}`)
  }

  log.success(`  ✓ case-stats-permission completado (${data.length} slugs)`)
}
