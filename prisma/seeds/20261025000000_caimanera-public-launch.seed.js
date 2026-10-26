/**
 * 20261025000000_caimanera-public-launch.seed.js
 *
 * Public launch hardening:
 * - adds the self-service enrollment permission
 * - removes the administrative participants:create permission from PLAYER
 *
 * Uso: node prisma/seed --only=20261025000000_caimanera-public-launch
 */

exports.name = '20261025000000_caimanera-public-launch'

const { helpers } = require('./_runner')
const DATA_FILE = '20261025000000_caimanera-public-launch.json'

exports.run = async (prisma, log) => {
  const { permissions, rolePermissions, adminEmail } = helpers.loadData(DATA_FILE)

  log.info('📌 Ajustes de lanzamiento público…')

  if (adminEmail?.from && adminEmail?.to) {
    const legacyAdmin = await prisma.user.findUnique({
      where: { email: adminEmail.from },
      select: { id: true },
    })
    if (legacyAdmin) {
      await prisma.user.update({
        where: { id: legacyAdmin.id },
        data: { email: adminEmail.to },
      })
      log.success(`  ✓ correo admin: ${adminEmail.from} → ${adminEmail.to}`)
    }
  }

  const permissionMap = {}
  for (const permission of permissions) {
    permissionMap[permission.slug] = await prisma.permission.upsert({
      where: { slug: permission.slug },
      update: { description: permission.description },
      create: permission,
    })
    log.success(`  ✓ permiso ${permission.slug}`)
  }

  for (const [roleName, change] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } })
    if (!role) {
      log.warn(`  ⚠️  Rol ${roleName} no encontrado`)
      continue
    }

    for (const slug of change.remove || []) {
      const permission = await prisma.permission.findUnique({ where: { slug } })
      if (!permission) continue
      await prisma.rolePermission.deleteMany({
        where: { roleId: role.id, permissionId: permission.id },
      })
      log.success(`  − ${slug} → ${roleName}`)
    }

    for (const slug of change.add || []) {
      const permission = permissionMap[slug] || (await prisma.permission.findUnique({ where: { slug } }))
      if (!permission) continue
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permission.id },
        },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      })
      log.success(`  + ${slug} → ${roleName}`)
    }
  }
}
