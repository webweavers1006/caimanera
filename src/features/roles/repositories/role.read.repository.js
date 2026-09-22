import prisma from "@/features/shared/lib/prisma";
import { roleMapper } from "../mappers/role.mapper";

/**
 * Obtiene todos los roles básicos (id y name).
 */
export async function getAllRoles() {
  const rawRoles = await prisma.role.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  });
  return roleMapper.toDomainList(rawRoles);
}

/**
 * Busca un rol por su nombre exacto.
 */
export async function getRoleByName(name, excludeId = null) {
  const rawRole = await prisma.role.findFirst({
    where: {
      name,
      deletedAt: null,
      ...(excludeId && { NOT: { id: excludeId } })
    },
    select: { id: true, name: true }
  });
  return roleMapper.toDomain(rawRole);
}

/**
 * Obtiene roles paginados con filtros y ordenamiento.
 */
export async function getRolesPaginated({ page, pageSize, searchTerm, sortKey, sortDirection }) {
  const skip = (page - 1) * pageSize;

  let orderBy = { createdAt: "desc" };

  if (sortKey === "usersCount") {
    orderBy = {
      users: {
        _count: sortDirection
      }
    };
  } else if (sortKey) {
    const dbKey = roleMapper.toSortKey(sortKey);
    orderBy = { [dbKey]: sortDirection };
  }

  const where = {
    deletedAt: null,
    ...(searchTerm && {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } }
      ]
    }),
  };

  const [totalCount, rawRoles] = await Promise.all([
    prisma.role.count({ where }),
    prisma.role.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
      include: {
        _count: { select: { users: true } }
      }
    }),
  ]);

  const roles = rawRoles.map(role => {
    const domain = roleMapper.toDomain(role);
    domain.usersCount = role._count?.users || 0;
    return domain;
  });

  return { 
    totalCount, 
    roles, 
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize) 
  };
}

/**
 * Obtiene un rol por ID con conteo de usuarios.
 */
export async function getRoleByIdWithUserCount(id) {
  const rawRole = await prisma.role.findUnique({
    where: { id, deletedAt: null },
    include: { _count: { select: { users: true } } }
  });
  if (!rawRole) return null;
  const domain = roleMapper.toDomain(rawRole);
  domain.usersCount = rawRole._count?.users || 0;
  return domain;
}

/**
 * Obtiene un rol por ID con sus permisos.
 */
export async function getRoleByIdWithPermissions(id) {
  const rawRole = await prisma.role.findUnique({
    where: { id, deletedAt: null },
    include: {
      rolePermissions: { include: { permission: true } }
    }
  });
  return roleMapper.toDomain(rawRole);
}
