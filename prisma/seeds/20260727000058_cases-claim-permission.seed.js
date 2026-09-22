/**
 * 20260727000058_cases-claim-permission.seed.js
 *
 * Creado: 2026-07-27T04:00:58.546Z
 * Uso:    node prisma/seed --only=20260727000058_cases-claim-permission
 *
 * Registra el permiso cases:claim y lo asigna a ADMIN, OPERADOR y DIRECCION.
 */

exports.name = '20260727000058_cases-claim-permission'

const { helpers } = require('./_runner')
const DATA_FILE = '20260727000058_cases-claim-permission.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 cases-claim-permission…')

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

  // Assign to ADMIN, OPERADOR, and DIRECCION roles
  const targetRoles = ['ADMIN', 'OPERADOR', 'DIRECCION']
  const claimPerm = created['cases:claim']

  for (const roleName of targetRoles) {
    const role = await prisma.role.findUnique({ where: { name: roleName } })
    if (!role) {
      log.warn(`  ⚠️  Rol ${roleName} no encontrado — omitido`)
      continue
    }

    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: claimPerm.id } },
      update: {},
      create: { roleId: role.id, permissionId: claimPerm.id },
    })
    log.success(`  ✓ cases:claim → ${roleName}`)
  }

  log.success(`  ✓ cases-claim-permission completado (${data.length} slugs)`)
}
