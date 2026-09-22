/**
 * State Mapper — transforms between persistence (DB) and domain (app).
 *
 * All fields in English (Prisma model names), mapped to Spanish DB columns
 * via Prisma @map / @@map.
 */

export const stateMapper = {
  toDomain(raw) {
    if (!raw) return null;
    return {
      id: raw.id,
      name: raw.name,
      pcode: raw.pcode,
      countryId: raw.countryId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  },

  toDomainList(list) {
    if (!list) return [];
    return list.map(this.toDomain);
  },

  toPersistence(domain) {
    return {
      name: domain.name?.trim().toUpperCase(),
      countryId: domain.countryId,
    };
  },

  toSortKey(domainKey) {
    const map = {
      name: "name",
      id: "id",
      createdAt: "createdAt",
    };
    return map[domainKey] || "name";
  },
};
