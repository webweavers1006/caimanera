/**
 * Mapper for the Court entity.
 * Centralizes transformation between Prisma and Domain.
 */

export const courtMapper = {
  /**
   * Transforms a Prisma record into a Domain object.
   */
  toDomain(raw) {
    if (!raw) return null;
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      sport: raw.sport,
      address: raw.address,
      latitude: raw.latitude,
      longitude: raw.longitude,
      hourlyRate: raw.hourlyRate,
      isActive: raw.isActive,
      managerId: raw.managerId,
      managerName: raw.manager
        ? `${raw.manager.firstName} ${raw.manager.lastName || ""}`.trim()
        : null,
      photos: (raw.photos || []).map((p) => ({ id: p.id, url: p.url })),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  },

  /**
   * Transforms a list of Prisma records.
   */
  toDomainList(list) {
    if (!list) return [];
    return list.map(this.toDomain);
  },

  /**
   * Transforms a Domain object into a Prisma write payload.
   * Court names and sports preserve their natural casing.
   */
  toPersistence(domain) {
    return {
      name: domain.name?.trim(),
      description: domain.description?.trim() || null,
      sport: domain.sport?.trim(),
      address: domain.address?.trim() || null,
      latitude: domain.latitude != null ? Number(domain.latitude) : undefined,
      longitude: domain.longitude != null ? Number(domain.longitude) : undefined,
      hourlyRate:
        domain.hourlyRate != null && domain.hourlyRate !== ""
          ? Number(domain.hourlyRate)
          : null,
      isActive: domain.isActive ?? true,
      managerId: domain.managerId || null,
    };
  },

  /**
   * Maps a domain-level sort key to the database column name.
   */
  toSortKey(domainKey) {
    const map = {
      name: "name",
      sport: "sport",
      isActive: "isActive",
      createdAt: "createdAt",
    };
    return map[domainKey] || "createdAt";
  },
};
