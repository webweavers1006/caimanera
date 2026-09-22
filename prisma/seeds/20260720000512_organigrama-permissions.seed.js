/**
 * 20260720000512_organigrama-permissions.seed.js
 *
 * Creado: 2026-07-20T04:05:12.731Z
 * Uso:    node prisma/seed --only=20260720000512_organigrama-permissions
 */

exports.name = '20260720000512_organigrama-permissions'

const { helpers } = require('./_runner')
const DATA_FILE = '20260720000512_organigrama-permissions.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 organigrama-permissions…')

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

  // Assign to ADMIN role
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
  }

  // Also assign read/view to DIRECCION role
  const direccion = await prisma.role.findUnique({ where: { name: 'DIRECCION' } })
  if (direccion && created['organigrama:view'] && created['organigrama:read']) {
    for (const slug of ['organigrama:view', 'organigrama:read']) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: direccion.id, permissionId: created[slug].id } },
        update: {},
        create: { roleId: direccion.id, permissionId: created[slug].id },
      })
    }
    log.success('  ✓ view + read → DIRECCION')
  }

  log.success(`  ✓ organigrama-permissions completado (${data.length} slugs)`)
}

