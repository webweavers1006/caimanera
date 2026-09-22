import { cache } from "react";
import { hierarchyReadRepository } from "@/features/shared/repositories/hierarchy.read.repository";
import { expandTree, collectDepartmentsUnderUnits } from "@/features/shared/lib/hierarchy-tree";
import { logger } from "@/features/shared/lib/logger";

/**
 * Hierarchy Service — resolves which users a leader/supervisor can see.
 *
 * Visibility sources (union), resolved in cascade:
 *   A. Members of units the user leads — INCLUDING descendant units
 *   B. Members of departments the user leads — INCLUDING descendant departments
 *   C. Members of departments under the led units (any depth)
 *   D. If leader of a direction: all users in that direction (units + departments)
 *   E. Users the user supervises (UserSupervision.supervisorId)
 *   F. The user themselves
 *
 * Used by scope-filter.factory.js to build Prisma WHERE clauses.
 */

/**
 * Resolves the expanded hierarchy for a leader in a single pass.
 *
 * @param {string} leaderId - UUID of the leader/supervisor
 * @returns {Promise<{
 *   expandedUnitIds: Set<number>,
 *   expandedDepartmentIds: Set<number>,
 *   ledDirectionIds: number[],
 *   supervisedIds: string[],
 * }>}
 */
async function resolveHierarchyExpansion(leaderId) {
  const [ledUnitIds, ledDepartmentIds, ledDirectionIds, supervisedIds, allDepartments] =
    await Promise.all([
      hierarchyReadRepository.findLedUnitIds(leaderId),
      hierarchyReadRepository.findLedDepartmentIds(leaderId),
      hierarchyReadRepository.findLedDirectionIds(leaderId),
      hierarchyReadRepository.findSupervisedUserIds(leaderId),
      hierarchyReadRepository.findAllActiveDepartments(),
    ]);

  // Units are flat (no sub-units); departments nest recursively.
  const expandedUnitIds = new Set(ledUnitIds);
  const expandedDepartmentIds = expandTree(
    ledDepartmentIds,
    allDepartments.map(d => ({ id: d.id, parentId: d.parentDepartmentId }))
  );

  // Cascade: every department under a led unit (any depth) is also visible.
  for (const id of collectDepartmentsUnderUnits(allDepartments, expandedUnitIds)) {
    expandedDepartmentIds.add(id);
  }

  // Remissions target units, not departments: a department leader must also
  // see cases forwarded to the unit their department hangs from.
  for (const department of allDepartments) {
    if (expandedDepartmentIds.has(department.id)) {
      expandedUnitIds.add(department.organizationalUnitId);
    }
  }

  return { expandedUnitIds, expandedDepartmentIds, ledDirectionIds, supervisedIds };
}

/**
 * Returns the set of user IDs visible to a given leader.
 *
 * @param {string} leaderId - UUID of the leader/supervisor
 * @param {{ includeDeleted?: boolean }} [options] - pass true when IDs will
 *   be used to filter cases (soft-deleted users' cases must still be visible)
 * @returns {Promise<string[]>} Array of user IDs
 */
export const getVisibleUserIds = cache(async (leaderId, { includeDeleted = false } = {}) => {
  if (!leaderId) return [];
  const snapshot = await getHierarchySnapshot(leaderId);
  return includeDeleted ? snapshot.visibleUserIds : snapshot.activeUserIds;
});

/**
 * Combined hierarchy snapshot for a leader — resolved in a single pass:
 *   activeUserIds  → active team members (soft-deleted excluded)
 *   visibleUserIds → all members including soft-deleted (their cases must
 *                    remain visible in scope filters)
 *   hasTeam        → whether the user leads/supervises anyone
 *   unitIds        → EXPANDED led units (cascade: parent units + child units,
 *                    plus units of led departments for remittance visibility)
 *   departmentIds  → EXPANDED led departments (cascade)
 *   directionIds   → led directions
 *
 * React.cache'd per request: repeated calls within the same render
 * (e.g. the case list pipeline) cost zero extra DB queries.
 *
 * @param {string} leaderId - UUID of the leader/supervisor
 * @returns {Promise<{activeUserIds: string[], visibleUserIds: string[], hasTeam: boolean, unitIds: number[], departmentIds: number[], directionIds: number[]}>}
 */
export const getHierarchySnapshot = cache(async (leaderId) => {
  if (!leaderId) {
    return { activeUserIds: [], visibleUserIds: [], hasTeam: false, unitIds: [], departmentIds: [], directionIds: [] };
  }

  try {
    const { expandedUnitIds, expandedDepartmentIds, ledDirectionIds, supervisedIds } =
      await resolveHierarchyExpansion(leaderId);

    const unitIds = [...expandedUnitIds];
    const departmentIds = [...expandedDepartmentIds];

    const [activeUnitMembers, activeDepartmentMembers, activeDirectionMembers,
      allUnitMembers, allDepartmentMembers, allDirectionMembers] =
      await Promise.all([
        hierarchyReadRepository.findUserIdsByUnitIds(unitIds, { includeDeleted: false }),
        hierarchyReadRepository.findUserIdsByDepartmentIds(departmentIds, { includeDeleted: false }),
        hierarchyReadRepository.findUserIdsByDirectionIds(ledDirectionIds, { includeDeleted: false }),
        hierarchyReadRepository.findUserIdsByUnitIds(unitIds, { includeDeleted: true }),
        hierarchyReadRepository.findUserIdsByDepartmentIds(departmentIds, { includeDeleted: true }),
        hierarchyReadRepository.findUserIdsByDirectionIds(ledDirectionIds, { includeDeleted: true }),
      ]);

    const activeUserIds = [...new Set([
      leaderId,
      ...activeUnitMembers,
      ...activeDepartmentMembers,
      ...activeDirectionMembers,
      ...supervisedIds,
    ])];

    const visibleUserIds = [...new Set([
      leaderId,
      ...allUnitMembers,
      ...allDepartmentMembers,
      ...allDirectionMembers,
      ...supervisedIds,
    ])];

    return {
      activeUserIds,
      visibleUserIds,
      hasTeam: activeUserIds.length > 1,
      unitIds,
      departmentIds,
      directionIds: ledDirectionIds,
    };
  } catch (error) {
    logger.error("getHierarchySnapshot error", { error: error.message, leaderId });
    return {
      activeUserIds: [leaderId],
      visibleUserIds: [leaderId],
      hasTeam: false,
      unitIds: [],
      departmentIds: [],
      directionIds: [],
    };
  }
});
