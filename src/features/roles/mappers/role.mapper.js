/**
 * Mapeador para la entidad Role.
 * Centraliza la transformación entre Prisma y el Dominio.
 */

export const roleMapper = {
  /**
   * Transforms a Prisma record into a Domain object.
   */
  toDomain(entity) {
    if (!entity) return null;

    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      isActive: entity.deletedAt == null,
      deletedAt: entity.deletedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,

      // Relación pivot (rolePermissions)
      permissions: entity.rolePermissions
        ? entity.rolePermissions.map((rp) => ({
            id: rp.permission.id,
            slug: rp.permission.slug,
            description: rp.permission.description,
          }))
        : undefined,

      permissionIds: entity.rolePermissions
        ? entity.rolePermissions.map((rp) => rp.permissionId)
        : undefined,
    };
  },

  /**
   * Transforms a list of Prisma records.
   */
  toDomainList(entities) {
    if (!entities || !Array.isArray(entities)) return [];
    return entities.map(this.toDomain);
  },

  /**
   * Transforms a Domain object into a Prisma write payload.
   */
  toPersistence(domain) {
    if (!domain) return null;

    return {
      name: domain.name?.trim().toUpperCase(),
      description: domain.description?.trim().toUpperCase(),
    };
  },

  /**
   * Translates domain sort keys to Prisma field names.
   */
  toSortKey(domainKey) {
    const allowedKeys = ["name", "description", "createdAt"];
    return allowedKeys.includes(domainKey) ? domainKey : "createdAt";
  }
};
