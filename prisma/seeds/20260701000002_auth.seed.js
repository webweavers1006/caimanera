/**
 * auth.seed.js — Roles, permisos, admin user y asignaciones M2M.
 *
 * Datos: seed-data/roles.json, permissions.json, admin-user.json
 * Uso:   node prisma/seed --only=auth
 */

exports.name = '20260701000000_auth'

const bcrypt = require('bcryptjs')
const { helpers } = require('./_runner')

const ROLE_PERM_MAP = {
  USER: ['users:view', 'roles:view', 'users:read', 'roles:read', 'notifications:read'],
  OPERADOR: [
    'operator_workspace:access', 'cases:view', 'persons:view',
    'persons:read', 'persons:create', 'persons:update',
    'cases:read', 'cases:create', 'cases:update',
    'case_follow_ups:read', 'case_follow_ups:create',
    'case_documents:read', 'case_documents:create',
    'notifications:view', 'notifications:read', 'notifications:mark_read', 'notifications:mark_all_read',
    'saime_consultations:consult',
  ],
  DIRECCION: [
    'cases:view', 'persons:view',
    'persons:read', 'persons:create', 'persons:update',
    'cases:read', 'cases:create', 'cases:update',
    'case_follow_ups:read', 'case_follow_ups:create',
    'case_documents:read', 'case_documents:create',
    'case_forwards:read', 'case_sheets:generate',
    'notifications:view', 'notifications:read', 'notifications:mark_read', 'notifications:mark_all_read',
    'saime_consultations:consult',
  ],
}

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const roles = helpers.loadData('roles.json')
  const permissions = helpers.loadData('permissions.json')
  const admin = helpers.loadData('admin-user.json')

  // 1. Roles
  log.info('📌 Roles…')
  const roleMap = {}
  for (const r of roles) {
    const created = await prisma.role.upsert({
      where: { name: r.name }, update: { description: r.description }, create: r,
    })
    roleMap[r.name] = created
  }
  log.success(`  ✓ ${roles.length} roles`)

  // 2. Permissions
  log.info('📌 Permisos…')
  const permMap = {}
  for (const p of permissions) {
    const created = await prisma.permission.upsert({
      where: { slug: p.slug }, update: { description: p.description }, create: p,
    })
    permMap[p.slug] = created
  }
  log.success(`  ✓ ${permissions.length} permisos`)

  // 3. ADMIN — all permissions
  log.info('📌 Asignaciones…')
  let n = 0
  for (const p of Object.values(permMap)) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roleMap['ADMIN'].id, permissionId: p.id } },
      update: {}, create: { roleId: roleMap['ADMIN'].id, permissionId: p.id },
    })
    n++
  }
  log.success(`  ✓ ${n} permisos → ADMIN`)

  // 4. Other roles
  for (const [roleName, slugs] of Object.entries(ROLE_PERM_MAP)) {
    if (!roleMap[roleName]) continue
    n = 0
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

  // 5. Admin user
  log.info('📌 Admin user…')
  const pw = process.env.ADMIN_PASSWORD_HASH || await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD, 10)
  const u = await prisma.user.upsert({
    where: { email: admin.email },
    update: { firstName: admin.firstName, lastName: admin.lastName, roleId: roleMap['ADMIN'].id },
    create: { ...admin, password: pw, roleId: roleMap['ADMIN'].id },
  })
  log.success(`  ✓ ${u.email}`)
}
