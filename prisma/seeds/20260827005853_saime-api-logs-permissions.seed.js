/**
 * 20260827005853_saime-api-logs-permissions.seed.js
 *
 * Creado: 2026-08-27T04:58:53.349Z
 * Uso:    node prisma/seed --only=20260827005853_saime-api-logs-permissions
 *
 * Registra los permisos del nuevo módulo de auditoría:
 *   - saime_api_logs:view → Ver el módulo en el menú
 *   - saime_api_logs:read → Consultar el registro de peticiones SAIME
 *
 * Se asignan únicamente al rol ADMIN.
 */

exports.name = '20260827005853_saime-api-logs-permissions'

const { helpers } = require('./_runner')
const DATA_FILE = '20260827005853_saime-api-logs-permissions.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 saime-api-logs-permissions…')

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
