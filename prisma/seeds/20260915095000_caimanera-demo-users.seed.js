/**
 * 20260915095000_caimanera-demo-users.seed.js
 *
 * Creates the demo players and court managers used by the demo data seeder.
 * Without them, a clean install has no one to enroll in the demo matches.
 *
 * Uso: node prisma/seed --only=20260915095000_caimanera-demo-users
 */

exports.name = '20260915095000_caimanera-demo-users'

const bcrypt = require('bcryptjs')
const { helpers } = require('./_runner')
const DATA_FILE = '20260915095000_caimanera-demo-users.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const { users, password } = helpers.loadData(DATA_FILE)

  log.info('📌 Usuarios demo de Caimanera…')

  const roles = await prisma.role.findMany({
    where: { name: { in: ['PLAYER', 'COURT_MANAGER'] } },
    select: { id: true, name: true },
  })
  const roleMap = new Map(roles.map((role) => [role.name, role.id]))

  const passwordHash = await bcrypt.hash(password, 12)

  for (const user of users) {
    const roleId = roleMap.get(user.role)
    if (!roleId) {
      log.warn(`  ⚠️  Rol ${user.role} no encontrado — se omite ${user.firstName}`)
      continue
    }

    await prisma.user.upsert({
      where: { idCard: user.idCard },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: passwordHash,
        roleId,
        skillLevel: user.skillLevel,
        reliability: user.reliability,
        deletedAt: null,
      },
      create: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        idCard: user.idCard,
        password: passwordHash,
        roleId,
        skillLevel: user.skillLevel,
        reliability: user.reliability,
      },
    })

    log.success(`  ✓ ${user.role}: ${user.firstName} ${user.lastName} (${user.idCard})`)
  }
}
