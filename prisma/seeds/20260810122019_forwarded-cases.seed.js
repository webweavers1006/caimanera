/**
 * 20260810122019_forwarded-cases.seed.js
 *
 * Creado: 2026-08-10T16:20:19.219Z
 * Uso:    node prisma/seed --only=20260810122019_forwarded-cases
 */

exports.name = '20260810122019_forwarded-cases'

const { helpers } = require('./_runner')
const DATA_FILE = '20260810122019_forwarded-cases.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const data = helpers.loadData(DATA_FILE)
  log.info('📌 forwarded-cases…')

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

  log.success(`  ✓ forwarded-cases completado (${data.length} slugs)`) 
}
