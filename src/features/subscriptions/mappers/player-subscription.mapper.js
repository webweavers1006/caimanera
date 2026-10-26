/**
 * Mapper for the player's own subscriptions (passes).
 */

function resolveStatus(raw, now = Date.now()) {
  const end = raw.endDate ? new Date(raw.endDate).getTime() : 0;
  if (!raw.isActive || end < now) return "EXPIRED";
  if (Number(raw.remainingMatches) <= 0) return "DEPLETED";
  return "ACTIVE";
}

export const playerSubscriptionMapper = {
  toDomain(raw, now = Date.now()) {
    if (!raw) return null;
    return {
      id: raw.id,
      planId: raw.planId,
      planName: raw.plan?.name || "Pase",
      tier: raw.plan?.tier || null,
      price: raw.plan?.price ?? null,
      matchesIncluded: raw.plan?.matchesIncluded ?? null,
      priorityBooking: Boolean(raw.plan?.priorityBooking),
      startDate: raw.startDate,
      endDate: raw.endDate,
      isActive: raw.isActive,
      remainingMatches: raw.remainingMatches,
      status: resolveStatus(raw, now),
      createdAt: raw.createdAt,
    };
  },

  toDomainList(list, now = Date.now()) {
    if (!list) return [];
    return list.map((item) => this.toDomain(item, now));
  },
};
