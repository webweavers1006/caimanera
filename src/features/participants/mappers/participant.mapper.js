/**
 * Mapper for the Participant entity.
 * Centralizes transformation between Prisma and Domain.
 */

export const participantMapper = {
  /**
   * Transforms a Prisma record into a Domain object.
   */
  toDomain(raw) {
    if (!raw) return null;
    return {
      id: raw.id,
      userId: raw.userId,
      userName: raw.user
        ? `${raw.user.firstName} ${raw.user.lastName || ""}`.trim()
        : null,
      matchId: raw.matchId,
      matchTitle: raw.match?.title || null,
      status: raw.status,
      position: raw.position,
      paymentType: raw.paymentType,
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
      userId: domain.userId,
      matchId: domain.matchId,
      status: domain.status || "WAITLIST",
      position: domain.position?.trim() ? domain.position.trim() : null,
      paymentType: domain.paymentType || "PAY_PER_MATCH",
    };
  },

  /**
   * Maps a domain-level sort key to the database column name.
   */
  toSortKey(domainKey) {
    const map = {
      status: "status",
      paymentType: "paymentType",
      createdAt: "createdAt",
    };
    return map[domainKey] || "createdAt";
  },
};
