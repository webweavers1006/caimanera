/**
 * prisma/seeds/_runner.js — Mini seeder framework estilo Laravel.
 *
 * @example
 *   const { run } = require('./_runner')
 *   await run({ prisma, log, mode: 'supplement', only: 'permissions' })
 *
 * Cada .seed.js exporta: { name: string, run(prisma, log): Promise }
 */

const path = require('path')
const fs = require('fs')

// ── Registry (via Prisma Seeder model) ───────────────────────────────────────

async function isSeeded(prisma, name) {
  const found = await prisma.seeder.findUnique({ where: { name } })
  return !!found
}

async function markSeeded(prisma, name) {
  await prisma.seeder.upsert({
    where: { name },
    update: { executedAt: new Date() },
    create: { name },
  })
}

async function listSeeded(prisma) {
  return await prisma.seeder.findMany({ orderBy: { executedAt: 'asc' } })
}

async function resetRegistry(prisma) {
  await prisma.seeder.deleteMany()
}

// ── Auto-discovery ───────────────────────────────────────────────────────────

/**
 * Loads all .seed.js files from a directory, sorted alphabetically.
 * @returns {Array<{name: string, run: Function}>}
 */
function discoverSeeders(dir) {
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.seed.js'))
    .sort()

  return files.map(file => {
    const mod = require(path.join(dir, file))
    if (!mod.name || typeof mod.run !== 'function') {
      throw new Error(`Seeder ${file} must export { name, run(prisma, log) }`)
    }
    return mod
  })
}

// ── Runner ───────────────────────────────────────────────────────────────────

/**
 * Executes seeders with registry tracking.
 *
 * @param {Object} opts
 * @param {PrismaClient} opts.prisma
 * @param {Object} opts.log — { info, success, error, warn }
 * @param {'supplement'|'clean'} opts.mode
 * @param {string} [opts.only] — run a single seeder (force, ignores registry)
 * @param {boolean} [opts.force] — ignore registry, run all
 * @param {string} [opts.dir] — seeders directory (default: __dirname)
 */
async function runSeeders({ prisma, log, mode, only, force, dir }) {
  const seedersDir = dir || __dirname
  const all = discoverSeeders(seedersDir)

  if (only) {
    const seeder = all.find(s => s.name === only)
    if (!seeder) {
      log.error(`❌ Seeder "${only}" no encontrado.`)
      log.info(`   Disponibles: ${all.map(s => s.name).join(', ')}`)
      process.exit(1)
    }
    log.info(`🎯 Ejecutando seeder: ${only}\n`)
    await seeder.run(prisma, log)
    await markSeeded(prisma, only)
    log.success(`\n✅ ${only} completado.`)
    return
  }

  // Run all pending (or all if --force)
  let skipped = 0
  let executed = 0

  for (const seeder of all) {
    if (!force && (await isSeeded(prisma, seeder.name))) {
      log.info(`  ⏭️  ${seeder.name}: ya ejecutado`)
      skipped++
      continue
    }

    log.info(`\n📌 ${seeder.name}…`)
    await seeder.run(prisma, log)
    await markSeeded(prisma, seeder.name)
    executed++
  }

  log.info('')
  if (executed === 0 && skipped > 0) {
    log.info('✅ Todos los seeders ya estaban ejecutados.')
  } else {
    log.success(`✅ ${executed} ejecutados, ${skipped} omitidos.`)
  }
}

// ── Standard helpers for seeders ─────────────────────────────────────────────

const SEED_DATA_DIR = path.resolve(__dirname, '..', 'seed-data')

/**
 * Loads a JSON file from prisma/seed-data/
 * @param {string} file — e.g. 'countries.json'
 * @returns {Object|Array}
 */
function loadData(file) {
  return require(path.join(SEED_DATA_DIR, file))
}

/**
 * Generic upsert for catalogs where only the `name` changes.
 * @param {PrismaClient} prisma
 * @param {string} model — Prisma model name (e.g. 'country')
 * @param {Array} data — Array of items with `id` and `name`
 * @param {Object} log
 * @param {string} label — Human-readable label for logging
 * @param {Object} [extra] — Extra fields for create only (not updated)
 */
async function upsertCatalog(prisma, model, data, log, label, extra = {}) {
  for (const item of data) {
    await prisma[model].upsert({
      where: { id: item.id },
      update: { name: item.name },
      create: { ...item, ...extra },
    })
  }
  log.success(`  ✓ ${data.length} ${label}`)
}

const helpers = { loadData, upsertCatalog }

module.exports = { runSeeders, listSeeded, resetRegistry, isSeeded, markSeeded, helpers }
