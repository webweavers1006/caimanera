/**
 * 20260720000000_organigrama-data.seed.js
 *
 * Crea las unidades organizativas de ejemplo y asigna operadores.
 * Uso: node prisma/seed --only=20260720000000_organigrama-data
 */

exports.name = '20260720000000_organigrama-data'

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  log.info('📌 Organigrama — Unidades y miembros…')

  // ── Dirección base: Atención al Ciudadano ──────────────────────────────────
  const directionName = 'OFICINA DE ATENCIÓN AL CIUDADANO'
  const direction = await prisma.administrativeDirection.findFirst({
    where: { name: directionName, deletedAt: null },
  })
  if (!direction) {
    log.error(`  ❌ Dirección "${directionName}" no encontrada. Ejecuta primero el seeder de direcciones.`)
    return
  }
  log.info(`  ✓ Dirección: ${direction.name} (id=${direction.id})`)

  // ── Unidad 1: Coordinación de ATC ──────────────────────────────────────────
  const unit1Name = 'Coordinación de ATC'
  const leader1IdCard = '18836163' // YUSMARY CORCEGA

  const unit1Members = [
    '11592670', // NILSY RODRIGUEZ
    '12554674', // GEUDY GONZALEZ
    '14046368', // HAGGEN MENDOZA
    '14450962', // KARINA MARTINEZ
    '16952702', // YENNY SUAREZ
    '18440615', // KELLY FRANCO
    '20614507', // YOSIBEL CASTRO
    '25280467', // ZULAY MERCADO
    '5782127',  // GERONIMA VILLEGAS
    '6633325',  // GLORIA GUZMAN
    '4251539',  // RUBEN MONTOYA
    '26819895', // YUSMILEIDY FERNANDEZ
    '17759740', // IVANNA BERROTERAN
    '13636649', // ALEXANDER FUENTES
    '18889700', // EGLEE GONZALEZ
    '16620825', // ODALIS BERRIO
    '24312518', // ABDIEL SOTO
    '14065903', // ZANIS CAMPOS
    '13888845', // FRANCIS GONCALVES
    '19958933', // IRAMA ALVAREZ
    '29529378', // DAMIAN MORA
    '26272602', // JOYNER SARMIENTO
  ]

  await createUnitWithMembers(prisma, log, {
    name: unit1Name,
    directionId: direction.id,
    leaderIdCard: leader1IdCard,
    memberIdCards: unit1Members,
  })

  // ── Unidad 2: Coordinación de Call Center 0800 ─────────────────────────────
  const unit2Name = 'Coordinación de Call Center 0800'
  const leader2IdCard = '27038431' // ELY SAUL CHIRIVELLA

  const unit2Members = [
    '27107583', // YAIRAMY PARRA
    '29987346', // CHIQUINQUIRA CARRILLO
    '26243437', // YORLENYS RIVAS
    '29922823', // AHARON STOJS
    '30507019', // GENESIS BRICEÑO
    '22522441', // RAMÓN INFANTE
    '19195728', // NAYARITH CHAURAN
    '18676045', // RUBÉN BORROMÉ
  ]

  await createUnitWithMembers(prisma, log, {
    name: unit2Name,
    directionId: direction.id,
    leaderIdCard: leader2IdCard,
    memberIdCards: unit2Members,
  })

  log.success('  ✓ Organigrama listo')
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Creates an organizational unit (idempotent) and assigns members to it.
 */
async function createUnitWithMembers(prisma, log, { name, directionId, leaderIdCard, memberIdCards }) {
  // Find or create the unit
  let unit = await prisma.organizationalUnit.findFirst({
    where: { name, administrativeDirectionId: directionId, deletedAt: null },
  })

  if (!unit) {
    unit = await prisma.organizationalUnit.create({
      data: { name, administrativeDirectionId: directionId },
    })
    log.info(`  ✓ Unidad creada: ${name}`)
  } else {
    log.info(`  ✓ Unidad existente: ${name}`)
  }

  // Find the leader and assign to unit
  const leader = await prisma.user.findUnique({ where: { idCard: leaderIdCard } })
  if (!leader) {
    log.warn(`  ⚠️ Líder con cédula ${leaderIdCard} no encontrado — omitiendo`)
  } else {
    await prisma.organizationalUnit.update({
      where: { id: unit.id },
      data: { leaderId: leader.id },
    })
    // Leader is also a member of the unit
    await prisma.user.update({
      where: { id: leader.id },
      data: {
        organizationalUnitId: unit.id,
        administrativeDirectionId: directionId,
      },
    })
    log.info(`  ✓ Líder: ${leader.firstName} ${leader.lastName}`)
  }

  // Assign members
  let assigned = 0
  for (const idCard of memberIdCards) {
    const user = await prisma.user.findUnique({ where: { idCard } })
    if (!user) {
      log.warn(`  ⚠️ Usuario con cédula ${idCard} no encontrado — omitiendo`)
      continue
    }
    // Derive administrativeDirectionId from the unit
    await prisma.user.update({
      where: { id: user.id },
      data: {
        organizationalUnitId: unit.id,
        administrativeDirectionId: directionId,
      },
    })
    assigned++
  }
  log.success(`  ✓ ${assigned} miembros asignados a "${name}"`)
}
