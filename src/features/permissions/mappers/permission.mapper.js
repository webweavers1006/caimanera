/**
 * Permission Mapper
 * With Prisma @map, field names are already in English from the client.
 */

export const permissionMapper = {
  toDomain(entity) {
    if (!entity) return null;

    return {
      id:          entity.id,
      slug:        entity.slug,
      description: entity.description,
    };
  },

  toDomainList(entities) {
    if (!entities || !Array.isArray(entities)) return [];
    return entities.map(this.toDomain);
  },

  toPersistence(domain) {
    if (!domain) return null;

    return {
      slug:        domain.slug?.trim(),
      description: domain.description?.trim(),
    };
  },

  toSortKey(domainKey) {
    const allowedKeys = ["slug", "description", "createdAt"];
    return allowedKeys.includes(domainKey) ? domainKey : "slug";
  },
};
