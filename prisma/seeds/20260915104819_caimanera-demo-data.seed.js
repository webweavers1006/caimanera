/**
 * 20260915104819_caimanera-demo-data.seed.js
 *
 * Creado: 2026-09-15T14:48:19.675Z
 * Uso:    node prisma/seed --only=20260915104819_caimanera-demo-data
 */

exports.name = '20260915104819_caimanera-demo-data'

const { helpers } = require('./_runner')
const DATA_FILE = '20260915104819_caimanera-demo-data.json'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  const { courts, matches, participants, transactions, subscriptions } = helpers.loadData(DATA_FILE)

  // Helper: resolve an active user by idCard.
  const findUser = (idCard) => prisma.user.findFirst({ where: { idCard, deletedAt: null } })

  // 1. Courts
  log.info('📌 Canchas demo…')
  const courtMap = {}
  for (const c of courts) {
    const manager = c.managerIdCard ? await findUser(c.managerIdCard) : null
    let court = await prisma.court.findFirst({ where: { name: c.name, deletedAt: null } })
    if (!court) {
      court = await prisma.court.create({
        data: {
          name: c.name,
          description: c.description,
          sport: c.sport,
          address: c.address,
          latitude: c.latitude,
          longitude: c.longitude,
          hourlyRate: c.hourlyRate,
          isActive: true,
          managerId: manager?.id || null,
        },
      })
      log.success(`  ✓ ${court.name}`)
    } else {
      log.info(`  · ${court.name} ya existe`)
    }
    // Court photos (idempotent by URL)
    const photos = c.photos || []
    for (let i = 0; i < photos.length; i++) {
      const url = photos[i]
      const exists = await prisma.courtPhoto.findFirst({ where: { courtId: court.id, url } })
      if (!exists) {
        await prisma.courtPhoto.create({ data: { courtId: court.id, url, sortOrder: i } })
      }
    }

    courtMap[c.name] = court
  }

  // 2. Matches
  log.info('📌 Partidos demo…')
  const matchMap = {}
  for (const m of matches) {
    const host = await findUser(m.hostIdCard)
    const court = courtMap[m.courtName]
    if (!host || !court) {
      log.warn(`  ⚠️  ${m.title}: falta organizador o cancha`)
      continue
    }
    const scheduledAt = new Date(Date.now() + (m.daysFromNow || 1) * 24 * 60 * 60 * 1000)
    let match = await prisma.match.findFirst({ where: { title: m.title, deletedAt: null } })
    if (!match) {
      match = await prisma.match.create({
        data: {
          title: m.title,
          sport: m.sport,
          scheduledAt,
          durationMins: m.durationMins,
          capacity: m.capacity,
          pricePerSlot: m.pricePerSlot,
          allowSubscription: m.allowSubscription,
          status: m.status,
          hostId: host.id,
          courtId: court.id,
        },
      })
      log.success(`  ✓ ${match.title}`)
    } else {
      log.info(`  · ${match.title} ya existe`)
    }
    matchMap[m.title] = match
  }

  // 3. Participants
  log.info('📌 Participantes demo…')
  let participantCount = 0
  for (const p of participants) {
    const user = await findUser(p.userIdCard)
    const match = matchMap[p.matchTitle]
    if (!user || !match) {
      log.warn(`  ⚠️  ${p.userIdCard} → ${p.matchTitle}: falta jugador o partido`)
      continue
    }
    const existing = await prisma.participant.findFirst({ where: { userId: user.id, matchId: match.id } })
    if (!existing) {
      await prisma.participant.create({
        data: {
          userId: user.id,
          matchId: match.id,
          status: p.status,
          position: p.position || null,
          paymentType: p.paymentType,
        },
      })
      participantCount++
    }
  }
  log.success(`  ✓ ${participantCount} participantes`)

  // 4. Transactions
  log.info('📌 Transacciones demo…')
  let transactionCount = 0
  for (const t of transactions) {
    const user = await findUser(t.userIdCard)
    const match = matchMap[t.matchTitle]
    if (!user || !match) {
      log.warn(`  ⚠️  ${t.userIdCard}: falta jugador o partido`)
      continue
    }
    const existing = await prisma.transaction.findFirst({
      where: { userId: user.id, matchId: match.id, type: t.type },
    })
    if (!existing) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          matchId: match.id,
          amount: t.amount,
          type: t.type,
          status: t.status,
        },
      })
      transactionCount++
    }
  }
  log.success(`  ✓ ${transactionCount} transacciones`)

  // 5. Subscriptions
  log.info('📌 Suscripciones demo…')
  let subscriptionCount = 0
  for (const s of subscriptions) {
    const user = await findUser(s.userIdCard)
    const plan = await prisma.subscriptionPlan.findFirst({ where: { name: s.planName } })
    if (!user || !plan) {
      log.warn(`  ⚠️  ${s.userIdCard}: falta jugador o plan`)
      continue
    }
    const existing = await prisma.userSubscription.findFirst({
      where: { userId: user.id, planId: plan.id, isActive: true },
    })
    if (!existing) {
      await prisma.userSubscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + s.daysValid * 24 * 60 * 60 * 1000),
          isActive: s.isActive,
          remainingMatches: s.remainingMatches,
        },
      })
      subscriptionCount++
    }
  }
  log.success(`  ✓ ${subscriptionCount} suscripciones`)
}
