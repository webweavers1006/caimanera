import prisma from "@/features/shared/lib/prisma";

/**
 * Hierarchy Read Repository — data access for organizational hierarchy queries.
 * Used by hierarchy.service.js to resolve visibility scopes.
 *
 * All Prisma queries for organizational structure live here.
 */

export const hierarchyReadRepository = {
  /**
   * Returns unit IDs where the given user is the leader.
   * @param {string} leaderId
   * @returns {Promise<string[]>}
   */
  async findLedUnitIds(leaderId) {
    const units = await prisma.organizationalUnit.findMany({
      where: { leaderId, deletedAt: null },
      select: { id: true },
    });
    return units.map(u => u.id);
  },

  /**
   * Returns direction IDs where the given user is the leader.
   * @param {string} leaderId
   * @returns {Promise<string[]>}
   */
  async findLedDirectionIds(leaderId) {
    const dirs = await prisma.administrativeDirection.findMany({
      where: { leaderId, deletedAt: null },
      select: { id: true },
    });
    return dirs.map(d => d.id);
  },

  /**
   * Returns department IDs where the given user is the leader.
   * @param {string} leaderId
   * @returns {Promise<number[]>}
   */
  async findLedDepartmentIds(leaderId) {
    const departments = await prisma.department.findMany({
      where: { leaderId, deletedAt: null },
      select: { id: true },
    });
    return departments.map(d => d.id);
  },

  /**
   * Returns all active departments (flat) for tree expansion.
   * @returns {Promise<Array<{id: number, parentDepartmentId: number|null, organizationalUnitId: number}>>}
   */
  async findAllActiveDepartments() {
    return prisma.department.findMany({
      where: { deletedAt: null },
      select: { id: true, parentDepartmentId: true, organizationalUnitId: true },
    });
  },

  /**
   * Returns user IDs directly supervised by the given supervisor.
   * @param {string} supervisorId
   * @returns {Promise<string[]>}
   */
  async findSupervisedUserIds(supervisorId) {
    const rows = await prisma.userSupervision.findMany({
      where: { supervisorId },
      select: { userId: true },
    });
    return rows.map(r => r.userId);
  },

  /**
   * Returns user IDs belonging to the given organizational units.
   * Covers BOTH paths:
   *   A. Users directly assigned to the unit (organizationalUnitId)
   *   B. Users in departments under the unit (department → unit)
   *
   * @param {string[]} unitIds
   * @param {{ includeDeleted?: boolean }} [options] - pass true to include soft-deleted users
   * @returns {Promise<string[]>}
   */
  async findUserIdsByUnitIds(unitIds, { includeDeleted = false } = {}) {
    if (!unitIds || unitIds.length === 0) return [];
    const where = {
      OR: [
        // Legacy direct assignment (single-department derived column)
        { organizationalUnitId: { in: unitIds } },
        // N:M pivot: membership in any department under those units
        { departmentMembers: { some: { department: { organizationalUnitId: { in: unitIds } } } } },
      ],
    };
    if (!includeDeleted) where.deletedAt = null;
    const users = await prisma.user.findMany({ where, select: { id: true } });
    return users.map(u => u.id);
  },

  /**
   * Returns user IDs belonging to the given departments (N:M pivot).
   *
   * @param {number[]} departmentIds
   * @param {{ includeDeleted?: boolean }} [options] - pass true to include soft-deleted users
   * @returns {Promise<string[]>}
   */
  async findUserIdsByDepartmentIds(departmentIds, { includeDeleted = false } = {}) {
    if (!departmentIds || departmentIds.length === 0) return [];
    const where = {
      departmentMembers: { some: { departmentId: { in: departmentIds } } },
    };
    if (!includeDeleted) where.deletedAt = null;
    const users = await prisma.user.findMany({ where, select: { id: true } });
    return users.map(u => u.id);
  },

  /**
   * Returns user IDs belonging to units under the given administrative directions.
   * Covers THREE paths:
   *   A. Users directly assigned to the direction (administrativeDirectionId)
   *   B. Users in organizational units under the direction (unit → direction)
   *   C. Users in departments under those units (department → unit → direction)
   *
   * @param {number[]} directionIds
   * @param {{ includeDeleted?: boolean }} [options] - pass true to include soft-deleted users
   * @returns {Promise<string[]>}
   */
  async findUserIdsByDirectionIds(directionIds, { includeDeleted = false } = {}) {
    if (!directionIds || directionIds.length === 0) return [];
    const where = {
      OR: [
        { administrativeDirectionId: { in: directionIds } },
        { organizationalUnit: { administrativeDirectionId: { in: directionIds } } },
        { departmentMembers: { some: { department: { organizationalUnit: { administrativeDirectionId: { in: directionIds } } } } } },
      ],
    };
    if (!includeDeleted) where.deletedAt = null;
    const users = await prisma.user.findMany({ where, select: { id: true } });
    return users.map(u => u.id);
  },
};
