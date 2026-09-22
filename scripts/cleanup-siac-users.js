/**
 * scripts/cleanup-siac-users.js — One-off cleanup + demo users for Caimanera.
 *
 * 1. Soft-deletes all SIAC users (roles OPERADOR / DIRECCION), keeping ADMIN.
 * 2. Seeds demo users with roles PLAYER and COURT_MANAGER.
 *
 * Usage: node scripts/cleanup-siac-users.js
 */

require('dotenv').config()
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const DEMO_PASSWORD = 'caimanera123'

const DEMO_USERS = [
  // Players
  { firstName: 'Carlos', lastName: 'Pérez', email: 'carlos.perez@caimanera.app', idCard: 'V-10000001', role: 'PLAYER', skillLevel: 4, reliability: 92 },
  { firstName: 'María', lastName: 'Rodríguez', email: 'maria.rodriguez@caimanera.app', idCard: 'V-10000002', role: 'PLAYER', skillLevel: 3, reliability: 85 },
  { firstName: 'Luis', lastName: 'Gómez', email: 'luis.gomez@caimanera.app', idCard: 'V-10000003', role: 'PLAYER', skillLevel: 5, reliability: 97 },
  // Court managers
  { firstName: 'Ana', lastName: 'Torres', email: 'ana.torres@caimanera.app', idCard: 'V-20000001', role: 'COURT_MANAGER', skillLevel: null, reliability: null },
  { firstName: 'Pedro', lastName: 'Rivas', email: 'pedro.rivas@caimanera.app', idCard: 'V-20000002', role: 'COURT_MANAGER', skillLevel: null, reliability: null },
]

async function main() {
  // 1. Resolve roles
  const [operador, direccion, player, courtManager] = await Promise.all([
    prisma.role.findUnique({ where: { name: 'OPERADOR' } }),
    prisma.role.findUnique({ where: { name: 'DIRECCION' } }),
    prisma.role.findUnique({ where: { name: 'PLAYER' } }),
    prisma.role.findUnique({ where: { name: 'COURT_MANAGER' } }),
  ])

  // 2. Soft-delete SIAC users (OPERADOR + DIRECCION), keeping ADMIN
  const roleIds = [operador?.id, direccion?.id].filter(Boolean)
  if (roleIds.length > 0) {
    const result = await prisma.user.updateMany({
      where: { roleId: { in: roleIds }, deletedAt: null },
      data: { deletedAt: new Date() },
    })
    console.log(`✅ Soft-deleted ${result.count} SIAC users (OPERADOR/DIRECCION)`)
  } else {
    console.log('⚠️  Roles OPERADOR/DIRECCION no encontrados — nada que borrar')
  }

  // 3. Seed demo users
  const pw = process.env.ADMIN_PASSWORD_HASH || await bcrypt.hash(DEMO_PASSWORD, 10)

  for (const u of DEMO_USERS) {
    const role = u.role === 'PLAYER' ? player : courtManager
    if (!role) {
      console.warn(`⚠️  Rol ${u.role} no encontrado — se omite ${u.firstName}`)
      continue
    }

    const created = await prisma.user.upsert({
      where: { idCard: u.idCard },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        roleId: role.id,
        skillLevel: u.skillLevel,
        reliability: u.reliability,
        deletedAt: null,
      },
      create: {
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        idCard: u.idCard,
        password: pw,
        roleId: role.id,
        skillLevel: u.skillLevel,
        reliability: u.reliability,
      },
    })
    console.log(`✅ ${u.role}: ${created.firstName} ${created.lastName} (${created.idCard})`)
  }

  console.log('✨ Listo.')
}

main()
  .catch((e) => { console.error(`❌ ${e.message}`); process.exit(1) })
  .finally(() => prisma.$disconnect())
