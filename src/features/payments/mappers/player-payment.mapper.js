/**
 * Mapper for the player's own payment history.
 */

function readMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

export const playerPaymentMapper = {
  toDomain(raw, { matchTitle = null } = {}) {
    if (!raw) return null;
    const metadata = readMetadata(raw.metadata);
    const planName = metadata.planName || null;
    const concept = planName
      ? `Pase · ${planName}`
      : matchTitle || metadata.matchTitle || "Pago";

    return {
      id: raw.id,
      concept,
      matchId: raw.matchId,
      planName,
      amount: raw.amount,
      amountVes: raw.amountVes,
      currency: raw.currency,
      type: raw.type,
      method: raw.method,
      status: raw.status,
      reference: raw.reference,
      createdAt: raw.createdAt,
    };
  },

  toDomainList(list, matchTitles = new Map()) {
    if (!list) return [];
    return list.map((item) =>
      this.toDomain(item, { matchTitle: matchTitles.get(item.matchId) || null })
    );
  },
};
