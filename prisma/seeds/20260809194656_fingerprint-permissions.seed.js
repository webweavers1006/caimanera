/**
 * 20260809194656_fingerprint-permissions.seed.js
 *
 * Creado: 2026-08-09T23:46:56.767Z
 * Uso:    node prisma/seed --only=20260809194656_fingerprint-permissions
 */

exports.name = '20260809194656_fingerprint-permissions'

const { helpers } = require('./_runner')
const DATA_FILE = '20260809194656_fingerprint-permissions.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 fingerprint-permissions…')

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
