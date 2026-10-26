/**
 * Mapper for the administrative Transaction (payment) entity.
 */

function readMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

export const transactionMapper = {
  toDomain(raw, { matchTitle = null } = {}) {
    if (!raw) return null;
    const metadata = readMetadata(raw.metadata);
    const planName = metadata.planName || null;
    const concept =
      planName
        ? `Pase · ${planName}`
        : matchTitle || metadata.matchTitle || "Pago";

    return {
      id: raw.id,
      userId: raw.userId,
      userName: raw.user
        ? `${raw.user.firstName} ${raw.user.lastName || ""}`.trim()
        : null,
      userEmail: raw.user?.email || null,
      matchId: raw.matchId,
      concept,
      planId: metadata.planId || null,
      planName,
      amount: raw.amount,
      amountVes: raw.amountVes,
      currency: raw.currency,
      type: raw.type,
      method: raw.method,
      status: raw.status,
      reference: raw.reference,
      metadata,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  },

  toDomainList(list, matchTitles = new Map()) {
    if (!list) return [];
    return list.map((item) =>
      this.toDomain(item, { matchTitle: matchTitles.get(item.matchId) || null })
    );
  },

  toSortKey(domainKey) {
    const map = {
      amount: "amount",
      status: "status",
      method: "method",
      type: "type",
      createdAt: "createdAt",
    };
    return map[domainKey] || "createdAt";
  },
};
