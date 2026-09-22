/**
 * 20260907093851_reason-stats-permission.seed.js
 *
 * Creado: 2026-09-07T13:38:51.684Z
 * Uso:    node prisma/seed --only=20260907093851_reason-stats-permission
 *
 * Registra el permiso del nuevo módulo de estadísticas:
 *   - reason_stats:view → Estadísticas por Motivos
 *
 * Se asigna únicamente al rol ADMIN.
 */

exports.name = '20260907093851_reason-stats-permission'

const { helpers } = require('./_runner')
const DATA_FILE = '20260907093851_reason-stats-permission.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 reason-stats-permission…')

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
