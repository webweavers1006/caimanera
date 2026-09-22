/**
 * 20260901140013_delivery-manual-person.seed.js
 *
 * Creado: 2026-09-01T18:00:13.444Z
 * Uso:    node prisma/seed --only=20260901140013_delivery-manual-person
 */

exports.name = '20260901140013_delivery-manual-person'

const { helpers } = require('./_runner')
const DATA_FILE = '20260901140013_delivery-manual-person.json'

/** Roles that may register a person manually in the deliveries book */
const TARGET_ROLES = ['ADMIN', 'OPERADOR', 'DIRECCION']

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 delivery-manual-person…')

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

  // Assign to the roles that operate the deliveries book
  for (const roleName of TARGET_ROLES) {
    const role = await prisma.role.findUnique({ where: { name: roleName } })
    if (!role) {
      log.warn(`  ⚠️  Rol ${roleName} no encontrado — no asignado`)
      continue
    }
    let n = 0
    for (const p of Object.values(created)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
        update: {},
        create: { roleId: role.id, permissionId: p.id },
      })
      n++
    }
    log.success(`  ✓ ${n} permisos → ${roleName}`)
  }
}
