import { describe, it, expect } from "vitest";
import { transactionMapper } from "@/features/transactions/mappers/transaction.mapper";

function rawTransaction(overrides = {}) {
  return {
    id: "tx-1",
    userId: "user-1",
    user: { firstName: "María", lastName: "Rodríguez", email: "maria@test.app" },
    matchId: null,
    amount: 19.99,
    amountVes: null,
    currency: "USD",
    type: "SUBSCRIPTION_PURCHASE",
    method: "BDT",
    status: "PENDING",
    reference: "PASE-1",
    metadata: {
      planId: "plan-1",
      planName: "Pase Básico",
    },
    ...overrides,
  };
}

describe("transaction mapper", () => {
  it("builds the concept from the purchased pass", () => {
    const transaction = transactionMapper.toDomain(rawTransaction());

    expect(transaction.concept).toBe("Pase · Pase Básico");
    expect(transaction.planId).toBe("plan-1");
    expect(transaction.userName).toBe("María Rodríguez");
  });

  it("falls back to the match title for a match payment", () => {
    const transaction = transactionMapper.toDomain(
      rawTransaction({
        type: "PAY_PER_MATCH",
        matchId: "match-1",
        metadata: null,
      }),
      { matchTitle: "Fútbol 5 — Amigos" }
    );

    expect(transaction.concept).toBe("Fútbol 5 — Amigos");
  });
});
