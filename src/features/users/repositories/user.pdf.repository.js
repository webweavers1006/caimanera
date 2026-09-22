/**
 * user.pdf.repository.js
 * Read repository for PDF export queries.
 * Fetches all users matching filters with full relations (role permissions, office, direction, unit).
 * No pagination — returns all matching records.
 *
 * Architecture: Repository → Mapper (userMapper.toDomainList)
 */

import prisma from "@/features/shared/lib/prisma";
import { userMapper } from "../mappers/user.mapper";

/**
 * Finds all users for PDF export with full relations.
 *
 * @param {object} filters
 * @param {string} [filters.searchTerm]
 * @param {string} [filters.status] - "active"|"inactive"|"all"
 * @param {string} [filters.roleId]
 * @param {string} [filters.officeId]
 * @param {string} [filters.directionId]
 * @param {string} [filters.dateFrom]
 * @param {string} [filters.dateTo]
 * @param {string[]} [filters.userIds] - Specific user UUIDs to include (selection mode)
 * @returns {Promise<Array>} Domain user objects with role, permissions, office, direction, unit
 */
export async function findAllUsersForPdfExport({ searchTerm, status, roleId, officeId, directionId, dateFrom, dateTo, userIds } = {}) {
  const where = {
    ...(status === "active"   && { deletedAt: null }),
    ...(status === "inactive" && { deletedAt: { not: null } }),
    ...(searchTerm && {
      OR: [
        { firstName: { contains: searchTerm, mode: "insensitive" } },
        { lastName:  { contains: searchTerm, mode: "insensitive" } },
        { idCard:    { contains: searchTerm } },
        { email:     { contains: searchTerm, mode: "insensitive" } },
      ],
    }),
    ...(roleId && { roleId: { in: roleId.split(",").map(Number) } }),
    ...(officeId && { officeId: { in: officeId.split(",").map(Number) } }),
    ...(directionId && { administrativeDirectionId: { in: directionId.split(",").map(Number) } }),
    ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
    ...(dateTo && { createdAt: { ...(dateFrom ? { gte: new Date(dateFrom) } : {}), lte: new Date(dateTo + "T23:59:59.999Z") } }),
    // Selection mode: when userIds is provided, ignore other filters and only return those users
    ...(userIds && userIds.length > 0 && { id: { in: userIds } }),
  };

  const rawUsers = await prisma.user.findMany({
    where,
    orderBy: { firstName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      idCard: true,
      email: true,
      deletedAt: true,
      createdAt: true,
      role: {
        select: {
          id: true,
          name: true,
          rolePermissions: {
            select: { permission: { select: { id: true, slug: true, description: true } } },
          },
        },
      },
      office: { select: { id: true, name: true } },
      administrativeDirection: { select: { id: true, name: true } },
      organizationalUnit: { select: { id: true, name: true } },
    },
  });

  return userMapper.toDomainList(rawUsers);
}
