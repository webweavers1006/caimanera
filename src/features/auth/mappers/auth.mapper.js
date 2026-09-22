/**
 * Auth Mapper
 * With Prisma @map, field names are already in English from the client.
 */

export const authMapper = {
  toDomain(entity) {
    if (!entity) return null;

    return {
      id: entity.id,
      firstName: entity.firstName,
      idCard: entity.idCard,
      deletedAt: entity.deletedAt,
      roleName: entity.role?.name || null,
    };
  },

  toDomainList(entities) {
    if (!entities || !Array.isArray(entities)) return [];
    return entities.map(this.toDomain);
  },

  toPersistence(domain) {
    if (!domain) return null;
    return {
      idCard: domain.idCard?.trim(),
      password: domain.password,
      deletedAt: domain.deletedAt,
      roleId: domain.roleId,
    };
  },

  toSortKey(domainKey) {
    const allowedKeys = ["idCard", "deletedAt", "createdAt"];
    return allowedKeys.includes(domainKey) ? domainKey : "createdAt";
  },
};
