/**
 * 20260727034735_case-forwards-batch-permission.seed.js
 *
 * Creado: 2026-07-27T07:47:35.055Z
 * Uso:    node prisma/seed --only=20260727034735_case-forwards-batch-permission
 *
 * Registra el permiso case_forwards:batch y lo asigna a ADMIN, OPERADOR y DIRECCION.
 */

exports.name = '20260727034735_case-forwards-batch-permission'

const { helpers } = require('./_runner')
const DATA_FILE = '20260727034735_case-forwards-batch-permission.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 case-forwards-batch-permission…')

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
  const batchPerm = created['case_forwards:batch']

  for (const roleName of targetRoles) {
    const role = await prisma.role.findUnique({ where: { name: roleName } })
    if (!role) {
      log.warn(`  ⚠️  Rol ${roleName} no encontrado — omitido`)
      continue
    }

    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: batchPerm.id } },
      update: {},
      create: { roleId: role.id, permissionId: batchPerm.id },
    })
    log.success(`  ✓ case_forwards:batch → ${roleName}`)
  }

  log.success(`  ✓ case-forwards-batch-permission completado (${data.length} slugs)`)
}
