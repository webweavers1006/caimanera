import prisma from "@/features/shared/lib/prisma";
import { permissionMapper } from "../mappers/permission.mapper";

/**
 * Repository for Permission Read Operations.
 * Uses English field names — Prisma @map handles DB translation internally.
 */
export const permissionReadRepository = {
  /**
   * Returns all non-deleted permissions ordered by slug.
   */
  async findAll() {
    const rawPermissions = await prisma.permission.findMany({
      where: { deletedAt: null },
      orderBy: { slug: "asc" },
      select: {
        id: true,
        slug: true,
        description: true,
      },
    });
    return permissionMapper.toDomainList(rawPermissions);
  },

  /**
   * Returns paginated permissions with optional search and sorting.
   */
  async findPaginated({ page, pageSize, searchTerm, sortKey, sortDirection }) {
    const skip = (page - 1) * pageSize;

    const orderBy = sortKey
      ? { [permissionMapper.toSortKey(sortKey)]: sortDirection }
      : { slug: "asc" };

    const where = {
      deletedAt: null,
      ...(searchTerm && {
        OR: [
          { slug: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      }),
    };

    const [totalCount, rawPermissions] = await Promise.all([
      prisma.permission.count({ where }),
      prisma.permission.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          _count: { select: { rolePermissions: true } },
        },
      }),
    ]);

    const permissions = rawPermissions.map((p) => {
      const domain = permissionMapper.toDomain(p);
      domain.rolesCount = p._count?.rolePermissions || 0;
      return domain;
    });

    return {
      totalCount,
      permissions,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  },

  /**
   * Finds a permission by ID with role count.
   */
  async findByIdWithRoleCount(id) {
    const rawPermission = await prisma.permission.findUnique({
      where: { id, deletedAt: null },
      include: { _count: { select: { rolePermissions: true } } },
    });
    if (!rawPermission) return null;
    const domain = permissionMapper.toDomain(rawPermission);
    domain.rolesCount = rawPermission._count?.rolePermissions || 0;
    return domain;
  },

  /**
   * Finds a permission by slug (for uniqueness validation).
   * @param {string} slug
   * @param {number} [excludeId]
   */
  async findBySlug(slug, excludeId = null) {
    const rawPermission = await prisma.permission.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      select: { id: true, slug: true },
    });
    return permissionMapper.toDomain(rawPermission);
  },

  async countRolePermission(roleName, slug) {
    return await prisma.rolePermission.count({
      where: {
        role: { name: roleName },
        permission: { slug },
      },
    });
  },

  async findPermissionsByRole(roleName) {
    const permissions = await prisma.rolePermission.findMany({
      where: {
        role: { name: roleName },
      },
      include: {
        permission: true,
      },
    });

    return permissions.map((p) => permissionMapper.toDomain(p.permission));
  },
};

// Backward-compatible named exports for services/actions that use destructured imports
export const { findAll, findPaginated, findByIdWithRoleCount, findBySlug, countRolePermission, findPermissionsByRole } =
  permissionReadRepository;

// Also expose as standalone named functions for convenience
export const getPermissionBySlug = (slug, excludeId) => findBySlug(slug, excludeId);
export const getPermissionByIdWithRoleCount = (id) => findByIdWithRoleCount(id);
export const getPermissionsPaginated = (opts) => findPaginated(opts);
