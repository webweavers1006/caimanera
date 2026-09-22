/**
 * Mapper for the SubscriptionPlan entity.
 * Centralizes transformation between Prisma and Domain.
 */

export const subscriptionMapper = {
  /**
   * Transforms a Prisma record into a Domain object.
   */
  toDomain(raw) {
    if (!raw) return null;
    return {
      id: raw.id,
      name: raw.name,
      tier: raw.tier,
      price: raw.price,
      matchesIncluded: raw.matchesIncluded,
      priorityBooking: raw.priorityBooking,
      description: raw.description,
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
   */
  toPersistence(domain) {
    return {
      name: domain.name?.trim(),
      tier: domain.tier || "BASIC_PASS",
      price:
        domain.price != null && domain.price !== ""
          ? Number(domain.price)
          : undefined,
      matchesIncluded:
        domain.matchesIncluded != null && domain.matchesIncluded !== ""
          ? Number(domain.matchesIncluded)
          : undefined,
      priorityBooking: domain.priorityBooking ?? true,
      description: domain.description?.trim() || null,
    };
  },

  /**
   * Maps a domain-level sort key to the database column name.
   */
  toSortKey(domainKey) {
    const map = {
      name: "name",
      tier: "tier",
      price: "price",
      matchesIncluded: "matchesIncluded",
      priorityBooking: "priorityBooking",
      createdAt: "createdAt",
    };
    return map[domainKey] || "name";
  },
};
