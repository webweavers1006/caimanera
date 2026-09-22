import prisma from "@/features/shared/lib/prisma";
import { userMapper } from "../mappers/user.mapper";

/**
 * Busca usuarios con paginación, ordenamiento y filtros.
 */
export async function findUsersPaginated({ page, pageSize, searchTerm, status, roleId, officeId, directionId, dateFrom, dateTo, sortKey, sortDirection }) {
  const skip = (page - 1) * pageSize;

  let orderBy = { createdAt: "desc" };

  if (sortKey) {
    const dbKey = userMapper.toSortKey(sortKey);

    if (dbKey === "role") {
      orderBy = { role: { name: sortDirection } };
    } else {
      orderBy = { [dbKey]: sortDirection };
    }
  }

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
    // Catalog filters
    ...(roleId && { roleId: { in: roleId.split(",").map(Number) } }),
    ...(officeId && { officeId: { in: officeId.split(",").map(Number) } }),
    ...(directionId && { administrativeDirectionId: { in: directionId.split(",").map(Number) } }),
    // Date range — filter by createdAt
    ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
    ...(dateTo && { createdAt: { ...(dateFrom ? { gte: new Date(dateFrom) } : {}), lte: new Date(dateTo + "T23:59:59.999Z") } }),
  };

  const [totalCount, rawUsers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        idCard: true,
        email: true,
        roleId: true,
        administrativeDirectionId: true,
        attentionChannelId: true,
        officeId: true,
        organizationalUnitId: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { id: true, name: true, description: true } },
        administrativeDirection: { select: { id: true, name: true, email: true, isAudit: true, leaderId: true } },
        attentionChannel: { select: { id: true, name: true } },
        organizationalUnit: { select: { id: true, name: true } },
        departmentMembers: {
          where: { department: { deletedAt: null } },
          select: { department: { select: { id: true, name: true } } },
        },
      },
    }),
  ]);

  return {
    totalCount,
    users: userMapper.toDomainList(rawUsers),
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

/**
 * Busca un único usuario por ID.
 */
export async function findUserById(id) {
  const rawUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      idCard: true,
      email: true,
      roleId: true,
      administrativeDirectionId: true,
      attentionChannelId: true,
      officeId: true,
      organizationalUnitId: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      role: { select: { id: true, name: true, description: true } },
      administrativeDirection: { select: { id: true, name: true, email: true, isAudit: true, leaderId: true } },
      attentionChannel: { select: { id: true, name: true } },
      organizationalUnit: { select: { id: true, name: true, seeAllDirection: true } },
      departmentMembers: {
        where: { department: { deletedAt: null } },
        select: { department: { select: { id: true, name: true } } },
      },
    },
  });
  return userMapper.toDomain(rawUser);
}

/**
 * Finds the officeId for a given user (lightweight, no includes).
 * @param {string} id - User UUID.
 * @returns {Promise<{ officeId: number|null }|null>}
 */
export async function findUserOfficeById(id) {
  return await prisma.user.findUnique({
    where: { id },
    select: { officeId: true },
  });
}

/**
 * Finds the roleId for a given user (ultra-lightweight, single field).
 * Used by notification write service to resolve actionRoleId.
 * @param {string} id - User UUID.
 * @returns {Promise<{ roleId: number|null }|null>}
 */
export async function findUserRoleId(id) {
  return await prisma.user.findUnique({
    where: { id },
    select: { roleId: true },
  });
}

/**
 * Finds all non-deleted users belonging to a given administrative direction.
 * Used for notification routing when a case is forwarded.
 * @param {number} administrativeDirectionId
 * @returns {Promise<Array<{ id: string }>>} Minimal user objects.
 */
export async function findUsersByAdministrativeDirectionId(administrativeDirectionId) {
  const rawUsers = await prisma.user.findMany({
    where: {
      administrativeDirectionId: Number(administrativeDirectionId),
      deletedAt: null,
    },
    select: { id: true },
  });
  return rawUsers;
}

/**
 * Busca un usuario por idCard o email para verificar unicidad.
 */
export async function findUserByUniqueFields(idCard, email, currentId = null) {
  return await prisma.user.findFirst({
    where: {
      OR: [{ idCard }, { email }],
      NOT: currentId ? { id: currentId } : undefined,
    },
    select: { id: true, idCard: true, email: true },
  });
}

/**
 * Finds users eligible for credential sending.
 * Returns only non-deleted users with an email address.
 *
 * @param {string[]|null} userIds - Specific user UUIDs. Null/undefined for ALL active users.
 * @returns {Promise<Array<{id: string, email: string, firstName: string, lastName: string, role: {name: string}|null}>>}
 */
export async function findUsersForCredentials(userIds) {
  const userFilter = Array.isArray(userIds) && userIds.length > 0
    ? { in: userIds }
    : undefined;

  return await prisma.user.findMany({
    where: {
      deletedAt: null,
      ...(userFilter && { id: userFilter }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: { select: { name: true } },
    },
    orderBy: { firstName: "asc" },
  });
}
