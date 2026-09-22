/**
 * 20260915094642_caimanera-core.seed.js
 *
 * Creado: 2026-09-15T13:46:42.457Z
 * Uso:    node prisma/seed --only=20260915094642_caimanera-core
 */

exports.name = '20260915094642_caimanera-core'

const { helpers } = require('./_runner')
const DATA_FILE = '20260915094642_caimanera-core.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const { roles, permissions, rolePermissions, plans } = helpers.loadData(DATA_FILE)

  // 1. Roles
  log.info('📌 Roles Caimanera…')
  const roleMap = {}
  for (const r of roles) {
    roleMap[r.name] = await prisma.role.upsert({
      where: { name: r.name }, update: { description: r.description }, create: r,
    })
    log.success(`  ✓ rol ${r.name}`)
  }

  // 2. Permissions
  log.info('📌 Permisos Caimanera…')
  const permMap = {}
  for (const p of permissions) {
    permMap[p.slug] = await prisma.permission.upsert({
      where: { slug: p.slug }, update: { description: p.description }, create: p,
    })
  }
  log.success(`  ✓ ${permissions.length} permisos`)

  // 3. ADMIN — all new permissions
  const admin = await prisma.role.findUnique({ where: { name: 'ADMIN' } })
  if (admin) {
    for (const p of Object.values(permMap)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: admin.id, permissionId: p.id } },
        update: {}, create: { roleId: admin.id, permissionId: p.id },
      })
    }
    log.success('  ✓ permisos → ADMIN')
  }

  // 4. Role-specific assignments
  for (const [roleName, slugs] of Object.entries(rolePermissions)) {
    if (!roleMap[roleName]) continue
    let n = 0
    for (const slug of slugs) {
      const p = permMap[slug]; if (!p) continue
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: roleMap[roleName].id, permissionId: p.id } },
        update: {}, create: { roleId: roleMap[roleName].id, permissionId: p.id },
      })
      n++
    }
    log.success(`  ✓ ${n} permisos → ${roleName}`)
  }

  // 5. Default subscription plans (idempotent by name)
  log.info('📌 Planes de suscripción…')
  for (const plan of plans) {
    const existing = await prisma.subscriptionPlan.findFirst({ where: { name: plan.name } })
    if (!existing) {
      await prisma.subscriptionPlan.create({ data: plan })
      log.success(`  ✓ plan ${plan.name}`)
    } else {
      log.info(`  · plan ${plan.name} ya existe`)
    }
  }
}
