/**
 * fix-open-forwarded-cases.mjs
 *
 * Encuentra todos los casos abiertos (caseStatusId=1) que tienen al menos una
 * remisión activa (CaseForward con isActive=true) y los transiciona a
 * "EN PROCESO" (caseStatusId=3).
 *
 * Contexto:
 * El estatus "EN PROCESO" (id=3) se agregó el 2026-08-10. Antes de esa fecha,
 * los casos iban de "Abierto" → "Cerrado" directamente. La auto-transición
 * autoTransitionToInProgress() solo se ejecuta al crear NUEVAS remisiones.
 * Los casos remitidos antes del seed quedaron en "Abierto" y necesitan
 * esta migración correctiva.
 *
 * Uso:
 *   node scripts/fix-open-forwarded-cases.mjs              # dry-run (solo lista)
 *   node scripts/fix-open-forwarded-cases.mjs --execute    # ejecuta la actualización
 *   node scripts/fix-open-forwarded-cases.mjs --execute --batch=50  # batch size personalizado
 */

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

// ── Config ───────────────────────────────────────────────────────────────────

const CASE_STATUS = { OPEN: 1, IN_PROGRESS: 3 };
const DEFAULT_BATCH_SIZE = 100;

const args = process.argv.slice(2);
const isDryRun = !args.includes("--execute");
const batchArg = args.find((a) => a.startsWith("--batch="));
const batchSize = batchArg ? parseInt(batchArg.split("=")[1], 10) : DEFAULT_BATCH_SIZE;

// ── DB Connection ────────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═".repeat(60));
  console.log("  fix-open-forwarded-cases.mjs");
  console.log("  Transiciona casos Abiertos con remisiones → EN PROCESO");
  console.log("═".repeat(60));
  console.log(`  Modo:          ${isDryRun ? "🔍 DRY-RUN (sin --execute)" : "⚠️  EJECUCIÓN (--execute)"}`);
  console.log(`  Batch size:    ${batchSize}`);
  console.log(`  Fecha:         ${new Date().toISOString()}`);
  console.log("─".repeat(60));

  // 1. Find all open cases that have at least one active forward
  console.log("\n🔍 Buscando casos abiertos con remisiones activas...");

  const casesToFix = await prisma.case.findMany({
    where: {
      caseStatusId: CASE_STATUS.OPEN,
      deletedAt: null,
      caseForwards: {
        some: {
          isActive: true,
          deletedAt: null,
        },
      },
    },
    select: {
      id: true,
      requestNumber: true,
      caseStatusId: true,
      lastForwardedAt: true,
      caseForwards: {
        where: { isActive: true, deletedAt: null },
        select: {
          id: true,
          date: true,
          administrativeDirection: { select: { name: true } },
          organizationalUnit: { select: { name: true } },
        },
        take: 1,
        orderBy: { date: "desc" },
      },
    },
    orderBy: { id: "asc" },
  });

  console.log(`   Encontrados: ${casesToFix.length} casos\n`);

  if (casesToFix.length === 0) {
    console.log("✅ No hay casos que necesiten actualización. Nada que hacer.");
    await cleanup();
    return;
  }

  // 2. Show summary table
  console.log("─".repeat(100));
  console.log("  ID    | Solicitud       | Remitido a                              | Fecha remisión");
  console.log("─".repeat(100));

  for (const c of casesToFix) {
    const fwd = c.caseForwards[0];
    const target = fwd?.organizationalUnit?.name || fwd?.administrativeDirection?.name || "—";
    const fwdDate = fwd?.date ? new Date(fwd.date).toISOString().split("T")[0] : "—";
    console.log(
      `  ${String(c.id).padEnd(5)} | ${(c.requestNumber || `#${c.id}`).padEnd(15)} | ${target.padEnd(40)} | ${fwdDate}`
    );
  }

  console.log("─".repeat(100));

  if (isDryRun) {
    console.log(`\n🔍 DRY-RUN: Se actualizarían ${casesToFix.length} casos a "EN PROCESO" (id=3).`);
    console.log('   Para ejecutar: node scripts/fix-open-forwarded-cases.mjs --execute');
    await cleanup();
    return;
  }

  // 3. Execute the update in batches
  console.log(`\n⚠️  Ejecutando actualización de ${casesToFix.length} casos en lotes de ${batchSize}...\n`);

  let successCount = 0;
  let failCount = 0;
  const failures = [];

  for (let i = 0; i < casesToFix.length; i += batchSize) {
    const batch = casesToFix.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(casesToFix.length / batchSize);

    console.log(`  Lote ${batchNum}/${totalBatches} (${batch.length} casos)...`);

    const results = await Promise.allSettled(
      batch.map((c) =>
        prisma.case.update({
          where: { id: c.id },
          data: { caseStatusId: CASE_STATUS.IN_PROGRESS },
        })
      )
    );

    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      const c = batch[j];
      if (r.status === "fulfilled") {
        successCount++;
        console.log(`    ✓ #${c.id} ${c.requestNumber || ""} → EN PROCESO`);
      } else {
        failCount++;
        failures.push({ id: c.id, requestNumber: c.requestNumber, error: r.reason?.message });
        console.log(`    ✗ #${c.id} ${c.requestNumber || ""} ERROR: ${r.reason?.message}`);
      }
    }
  }

  // 4. Final summary
  console.log("\n" + "═".repeat(60));
  console.log("  RESUMEN FINAL");
  console.log("═".repeat(60));
  console.log(`  ✅ Actualizados:  ${successCount}`);
  console.log(`  ❌ Fallidos:      ${failCount}`);
  console.log(`  📊 Total:         ${casesToFix.length}`);

  if (failures.length > 0) {
    console.log("\n  Fallos:");
    for (const f of failures) {
      console.log(`    - #${f.id} ${f.requestNumber || ""}: ${f.error}`);
    }
  }

  console.log("\n✅ Script completado.");

  await cleanup();
}

async function cleanup() {
  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (err) => {
  console.error("\n❌ Error fatal:", err.message);
  console.error(err.stack);
  try {
    await prisma.$disconnect();
    await pool.end();
  } catch {
    // ignore cleanup errors
  }
  process.exit(1);
});
