/**
 * 20260807145328_stats-permissions.seed.js
 *
 * Creado: 2026-08-07T18:53:28.317Z
 * Uso:    node prisma/seed --only=20260807145328_stats-permissions
 *
 * Registra los permisos de los nuevos módulos de estadísticas:
 *   - follow_up_stats:view  → Estadísticas de Seguimientos
 *   - forward_stats:view    → Estadísticas de Remisiones
 *
 * Ambos se asignan únicamente al rol ADMIN.
 */

exports.name = '20260807145328_stats-permissions'

const { helpers } = require('./_runner')
const DATA_FILE = '20260807145328_stats-permissions.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 stats-permissions…')

  // 1. Upsert de cada permiso
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

  // 2. Asignar todos a ADMIN
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
