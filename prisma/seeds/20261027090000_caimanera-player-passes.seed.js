/**
 * 20261027090000_caimanera-player-passes.seed.js
 *
 * Enables player self-service pass purchases and seeds a pending example so
 * the admin reconciliation screen has something to confirm in demo data.
 *
 * Uso: node prisma/seed --only=20261027090000_caimanera-player-passes
 */

exports.name = '20261027090000_caimanera-player-passes'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const permission = await prisma.permission.upsert({
    where: { slug: 'subscriptions:purchase' },
    update: {
      description: 'Comprar o renovar el propio pase de jugador',
    },
    create: {
      slug: 'subscriptions:purchase',
      description: 'Comprar o renovar el propio pase de jugador',
    },
  })
  log.success('  ✓ permiso subscriptions:purchase')

  for (const roleName of ['PLAYER', 'ADMIN']) {
    const role = await prisma.role.findUnique({ where: { name: roleName } })
    if (!role) continue

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: role.id, permissionId: permission.id },
      },
      update: {},
      create: { roleId: role.id, permissionId: permission.id },
    })
    log.success(`  ✓ subscriptions:purchase → ${roleName}`)
  }

  const player = await prisma.user.findFirst({
    where: { idCard: 'V-10000002', deletedAt: null },
  })
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { name: 'Pase Básico', deletedAt: null },
  })

  if (player && plan) {
    const existing = await prisma.transaction.findFirst({
      where: {
        userId: player.id,
        type: 'SUBSCRIPTION_PURCHASE',
        status: 'PENDING',
        deletedAt: null,
      },
    })

    if (!existing) {
      await prisma.transaction.create({
        data: {
          userId: player.id,
          amount: plan.price,
          currency: 'USD',
          type: 'SUBSCRIPTION_PURCHASE',
          method: 'BDT',
          status: 'PENDING',
          reference: 'PASE-DEMO-PENDIENTE',
          metadata: {
            source: 'demo_seed',
            planId: plan.id,
            planName: plan.name,
            tier: plan.tier,
            durationDays: 30,
          },
        },
      })
      log.success('  ✓ compra de pase pendiente de ejemplo')
    } else {
      log.info('  · ya existe una compra de pase pendiente')
    }
  }
}
