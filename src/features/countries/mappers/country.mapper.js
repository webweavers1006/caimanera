export const countryMapper = {
  toDomain(raw) {
    if (!raw) return null;
    return {
      id: raw.id,
      name: raw.name,
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
    };
  },

  toSortKey(domainKey) {
    const map = {
      name: "name",
      createdAt: "createdAt",
    };
    return map[domainKey] || "createdAt";
  },
};
