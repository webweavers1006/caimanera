/**
 * Parish Mapper — transforms between persistence (DB) and domain (app).
 */

export const parishMapper = {
  toDomain(raw) {
    if (!raw) return null;
    return {
      id: raw.id,
      name: raw.name,
      pcode: raw.pcode,
      geoData: raw.geoData,
      municipalityId: raw.municipalityId,
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
      municipalityId: domain.municipalityId,
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
