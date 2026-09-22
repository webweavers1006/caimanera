/**
 * Hierarchy Tree Helpers — pure functions for transitive expansion of
 * organizational trees (organizational units and departments).
 *
 * No Prisma here: these operate on plain { id, parentId } nodes so the
 * visibility resolution in hierarchy.service.js stays readable and testable.
 */

/**
 * Expands a set of root node IDs into all their transitive descendants.
 * Works for any tree shaped as { id, parentId } (units, departments, etc.).
 *
 * @param {number[]} roots - Root node IDs to expand from.
 * @param {Array<{id: number, parentId: number|null}>} nodes - All nodes of the tree.
 * @returns {Set<number>} Roots + all descendants.
 */
export function expandTree(roots, nodes) {
  const childrenByParent = new Map();
  for (const node of nodes) {
    if (node.parentId == null) continue;
    if (!childrenByParent.has(node.parentId)) childrenByParent.set(node.parentId, []);
    childrenByParent.get(node.parentId).push(node.id);
  }

  const result = new Set();
  const stack = [...roots];
  while (stack.length > 0) {
    const id = stack.pop();
    if (result.has(id)) continue;
    result.add(id);
    const children = childrenByParent.get(id);
    if (children) stack.push(...children);
  }
  return result;
}

/**
 * Collects every department that hangs (directly or transitively) under any
 * of the given units. A department belongs to a unit via organizationalUnitId.
 *
 * @param {Array<{id: number, organizationalUnitId: number}>} departments - All active departments.
 * @param {Set<number>} unitIds - Expanded set of unit IDs.
 * @returns {Set<number>} Department IDs under those units.
 */
export function collectDepartmentsUnderUnits(departments, unitIds) {
  const result = new Set();
  for (const department of departments) {
    if (unitIds.has(department.organizationalUnitId)) result.add(department.id);
  }
  return result;
}
