/**
 * 20260727215343_fix-credential-emails.seed.js
 *
 * Corrige 5 correos de credenciales que se enviaron con formato incorrecto.
 * El Excel de QA tiene el formato correcto; este seeder alinea la BD.
 *
 * Creado: 2026-07-28T01:53:43.364Z
 * Uso:    node prisma/seed --only=20260727215343_fix-credential-emails
 * Prod:   node prisma/seed --only=20260727215343_fix-credential-emails --force
 */

exports.name = '20260727215343_fix-credential-emails'

const CORRECTIONS = [
  {
    codigo: 'OF024',
    oficina: 'LOS TEQUES I - SUPER LIDER',
    viejo: 'of024lostequessuperlider@saime.gob.ve',
    nuevo: 'of024superlider@saime.gob.ve',
  },
  {
    codigo: 'OF050',
    oficina: 'LOS TEQUES II - GUAICAIPURO',
    viejo: 'of050lostequesguaicaipuro@saime.gob.ve',
    nuevo: 'of050guaicaipuro@saime.gob.ve',
  },
  {
    codigo: 'OF072',
    oficina: '23 DE ENERO',
    viejo: 'of07223deenero@saime.gob.ve',
    nuevo: 'of072_23deenero@saime.gob.ve',
  },
  {
    codigo: 'OF136',
    oficina: 'TRAILER EL PLAYON',
    viejo: 'of136trailerplayon@saime.gob.ve',
    nuevo: 'of136trailerelplayon@saime.gob.ve',
  },
  {
    codigo: 'OF208',
    oficina: 'CORE III',
    viejo: 'of208trailercoreiii@saime.gob.ve',
    nuevo: 'of208coreiii@saime.gob.ve',
  },
]

/** @param {import('@prisma/client').PrismaClient} prisma */
exports.run = async (prisma, log) => {
  log.info('📌 Corrigiendo correos de credenciales…')

  let corregidos = 0
  let omitidos = 0

  for (const item of CORRECTIONS) {
    const result = await prisma.sentEmail.updateMany({
      where: {
        reason: 'CREDENTIALS_SENT',
        toAddress: item.viejo,
      },
      data: {
        toAddress: item.nuevo,
        updatedAt: new Date(),
      },
    })

    if (result.count > 0) {
      log.success(`  ✓ ${item.codigo} ${item.oficina}: ${item.viejo} → ${item.nuevo}`)
      corregidos += result.count
    } else {
      log.warn(`  ⏭️  ${item.codigo} ${item.oficina}: no encontrado (ya corregido o no existe)`)
      omitidos++
    }
  }

  log.success(`\n✅ ${corregidos} correos corregidos, ${omitidos} omitidos`)
}
