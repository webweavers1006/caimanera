/**
 * Diagnostic script — compares map vs stats "cases by state" queries.
 * Run: node scripts/diagnose-state-counts.mjs
 */
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── MAP query (case-coordinates/aggregateByState) ──
async function mapQuery() {
  const caseWhere = { deletedAt: null };

  const grouped = await prisma.case.groupBy({
    by: ["userId"],
    where: caseWhere,
    _count: { id: true },
  });

  const userIds = grouped.map(g => g.userId).filter(Boolean);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, deletedAt: null },
    select: { id: true, office: { select: { state: { select: { id: true, name: true, pcode: true } } } } },
  });

  const userStateMap = new Map();
  for (const u of users) {
    const sid = u.office?.state?.id;
    if (sid) userStateMap.set(u.id, { id: sid, name: u.office.state.name, pcode: u.office.state.pcode });
  }

  // Counts by stateId (map uses pcode, but we track both)
  const byState = {};
  const noStateCases = [];
  for (const g of grouped) {
    const stateInfo = userStateMap.get(g.userId);
    if (stateInfo) {
      const key = stateInfo.name;
      byState[key] = (byState[key] || 0) + g._count.id;
    } else {
      noStateCases.push({ userId: g.userId, count: g._count.id });
    }
  }

  console.log("\n=== MAP QUERY (aggregateByState) ===");
  console.log("WHERE:", JSON.stringify(caseWhere));
  console.log("Total grouped rows:", grouped.length);
  console.log("Total cases counted:", Object.values(byState).reduce((a, b) => a + b, 0));
  console.log("Cases with NO state (dropped by map):", noStateCases.reduce((a, b) => a + b.count, 0), "from", noStateCases.length, "users");
  console.log("By state:", JSON.stringify(byState, null, 2));
  if (noStateCases.length) console.log("No-state users:", JSON.stringify(noStateCases.slice(0, 10), null, 2));

  return { byState, noStateCases, totalGrouped: grouped.length };
}

// ── STATS query (case-stats/getTotalByState) ──
async function statsQuery() {
  const where = { deletedAt: null };
  // Same as buildWhereClause({}) for admin with no filters

  const [grouped, openForwardedGrouped] = await Promise.all([
    prisma.case.groupBy({
      by: ["userId", "caseStatusId"],
      where,
      _count: { id: true },
    }),
    prisma.case.groupBy({
      by: ["userId"],
      where: {
        ...where,
        caseStatusId: 1,
        caseForwards: { some: { isActive: true, deletedAt: null } },
      },
      _count: { id: true },
    }),
  ]);

  const userIds = [...new Set([
    ...grouped.map(r => r.userId),
    ...openForwardedGrouped.map(r => r.userId),
  ].filter(Boolean))];

  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, deletedAt: null },
    select: {
      id: true,
      office: { select: { state: { select: { id: true, name: true } } } },
    },
  });

  const userStateMap = {};
  const stateMap = {};
  for (const u of users) {
    const state = u.office?.state;
    if (state) {
      userStateMap[u.id] = state.id;
      stateMap[state.id] = state.name;
    }
  }

  // Aggregate by state (same logic as toTotalByStateFromGrouped)
  const agg = {};
  const noStateCases = [];
  for (const row of grouped) {
    const stateId = userStateMap[row.userId] ?? null;
    if (!stateId) {
      noStateCases.push({ userId: row.userId, caseStatusId: row.caseStatusId, count: row._count.id });
      continue;
    }
    const stateName = stateMap[stateId] || "Desconocido";
    const key = stateName;
    if (!agg[key]) {
      agg[key] = { open: 0, closed: 0, total: 0, openForwarded: 0 };
    }
    if (row.caseStatusId === 1) agg[key].open += row._count.id;
    if (row.caseStatusId === 2) agg[key].closed += row._count.id;
    agg[key].total += row._count.id;
  }

  // Forwarded breakdown
  for (const row of openForwardedGrouped) {
    const stateId = userStateMap[row.userId] ?? null;
    if (!stateId) continue;
    const stateName = stateMap[stateId];
    if (agg[stateName]) agg[stateName].openForwarded += row._count.id;
  }

  console.log("\n=== STATS QUERY (getTotalByState) ===");
  console.log("WHERE:", JSON.stringify(where));
  console.log("Total grouped rows:", grouped.length);
  const totalFromStats = Object.values(agg).reduce((a, b) => a + b.total, 0);
  console.log("Total cases counted (sum of totals):", totalFromStats);
  console.log("Cases with NO state (in 'Sin estado' bucket):", noStateCases.reduce((a, b) => a + b.count, 0), "from", noStateCases.length, "rows");
  console.log("By state:", JSON.stringify(agg, null, 2));
  if (noStateCases.length) console.log("No-state rows:", JSON.stringify(noStateCases.slice(0, 10), null, 2));

  return { agg, noStateCases, totalGrouped: grouped.length };
}

// ── MAIN ──
async function main() {
  console.log("=== DIAGNOSTIC: Cases by State — Map vs Stats vs Detail ===\n");

  const mapResult = await mapQuery();
  const statsResult = await statsQuery();

  // ── DETAIL query (getStateDetail — what the modal uses) ──
  console.log("\n=== DETAIL QUERY (getStateDetail for DISTRITO CAPITAL) ===");
  const dcTotal = await prisma.case.count({
    where: { deletedAt: null, user: { office: { state: { pcode: "01" } } } },
  });
  console.log("Total cases (user.office.state.pcode=01):", dcTotal);

  const dcByStatus = await prisma.case.groupBy({
    by: ["caseStatusId"],
    where: { deletedAt: null, user: { office: { state: { pcode: "01" } } } },
    _count: true,
  });
  console.log("By status:", JSON.stringify(dcByStatus));

  // Also check: what pcode is Distrito Capital?
  const dcState = await prisma.state.findFirst({
    where: { name: { contains: "Distrito", mode: "insensitive" } },
    select: { id: true, name: true, pcode: true },
  });
  console.log("Distrito Capital state record:", JSON.stringify(dcState));

  // Check ALL states with pcode
  const allStates = await prisma.state.findMany({
    select: { id: true, name: true, pcode: true },
  });
  console.log("\nAll states with pcodes:");
  for (const s of allStates.sort((a,b) => (a.pcode||"").localeCompare(b.pcode||""))) {
    console.log(`  pcode=${s.pcode} id=${s.id} name=${s.name}`);
  }

  console.log("\n=== COMPARISON ===");
  const allStateNames = new Set([
    ...Object.keys(mapResult.byState),
    ...Object.keys(statsResult.agg),
  ]);

  let hasDiff = false;
  for (const state of [...allStateNames].sort()) {
    const mapCount = mapResult.byState[state] || 0;
    const statsCount = (statsResult.agg[state]?.total) || 0;
    const diff = mapCount - statsCount;
    if (diff !== 0) {
      console.log(`🔴 ${state}: MAP=${mapCount}  STATS=${statsCount}  DIFF=${diff}`);
      hasDiff = true;
    } else {
      console.log(`✅ ${state}: ${mapCount}`);
    }
  }

  console.log(`\n📊 DETAIL (Distrito Capital): ${dcTotal} vs MAP aggregate: ${mapResult.byState["DISTRITO CAPITAL"] || 0}`);

  // ── FIND THE DISCREPANCY ──
  console.log("\n=== HUNTING THE 2 MISSING CASES ===");
  
  // Get user IDs that map resolved to DC
  const mapUsers = await prisma.user.findMany({
    where: { deletedAt: null, office: { state: { pcode: "01" } } },
    select: { id: true, firstName: true, lastName: true, deletedAt: true },
  });
  console.log("Users with office.state.pcode=01 and deletedAt=null:", mapUsers.length);
  for (const u of mapUsers) {
    const c = await prisma.case.count({ where: { userId: u.id, deletedAt: null } });
    console.log(`  ${u.firstName} ${u.lastName} (${u.id}) deletedAt=${u.deletedAt}: ${c} cases`);
  }

  // Get ALL users (including deleted) with office in DC
  const allDcUsers = await prisma.user.findMany({
    where: { office: { state: { pcode: "01" } } },
    select: { id: true, firstName: true, lastName: true, deletedAt: true },
  });
  console.log("\nALL users with office.state.pcode=01 (including deleted):", allDcUsers.length);
  for (const u of allDcUsers) {
    const c = await prisma.case.count({ where: { userId: u.id, deletedAt: null } });
    console.log(`  ${u.firstName} ${u.lastName} (${u.id}) deletedAt=${u.deletedAt}: ${c} cases`);
  }

  // Check: does Prisma's nested filter include cases from deleted users?
  console.log("\n--- Checking if getStateDetail includes deleted users ---");
  const dcTotalNoUserFilter = await prisma.case.count({
    where: { deletedAt: null, user: { office: { state: { pcode: "01" } } } },
  });
  const dcTotalExcludeDeletedUser = await prisma.case.count({
    where: { deletedAt: null, user: { deletedAt: null, office: { state: { pcode: "01" } } } },
  });
  console.log(`With user.deletedAt filter: ${dcTotalExcludeDeletedUser}`);
  console.log(`Without user.deletedAt filter: ${dcTotalNoUserFilter}`);
  console.log(`Difference (deleted users): ${dcTotalNoUserFilter - dcTotalExcludeDeletedUser}`);

  // Find the exact cases that getStateDetail counts but aggregateByState misses
  const detailCaseIds = await prisma.case.findMany({
    where: { deletedAt: null, user: { office: { state: { pcode: "01" } } } },
    select: { id: true, userId: true },
  });
  
  const mapUserIds = mapUsers.map(u => u.id);
  const missingCases = detailCaseIds.filter(c => !mapUserIds.includes(c.userId));
  console.log(`\nCases in detail but NOT in map aggregate: ${missingCases.length}`);
  for (const mc of missingCases) {
    const u = await prisma.user.findUnique({ where: { id: mc.userId }, select: { id: true, firstName: true, lastName: true, deletedAt: true, officeId: true } });
    console.log(`  caseId=${mc.id} userId=${mc.userId} user=${u?.firstName} ${u?.lastName} deletedAt=${u?.deletedAt} officeId=${u?.officeId}`);
  }

  if (!hasDiff) console.log("\n✅ No differences found! Both queries return identical counts.");
  else console.log("\n🔴 Differences detected!");

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
