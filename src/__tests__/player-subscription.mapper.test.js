import { describe, it, expect } from "vitest";
import { playerSubscriptionMapper } from "@/features/subscriptions/mappers/player-subscription.mapper";

const NOW = new Date("2026-10-26T12:00:00.000Z").getTime();
const FUTURE = "2026-11-25T12:00:00.000Z";
const PAST = "2026-09-25T12:00:00.000Z";

function rawPass(overrides = {}) {
  return {
    id: "pass-1",
    planId: "plan-1",
    plan: {
      name: "Pase PRO",
      tier: "PRO_MONTHLY",
      price: 34.99,
      matchesIncluded: 8,
      priorityBooking: true,
    },
    startDate: "2026-10-26T12:00:00.000Z",
    endDate: FUTURE,
    isActive: true,
    remainingMatches: 6,
    ...overrides,
  };
}

describe("player subscription mapper", () => {
  it("marks a pass with credits and a future end date as active", () => {
    const pass = playerSubscriptionMapper.toDomain(rawPass(), NOW);

    expect(pass.status).toBe("ACTIVE");
    expect(pass.planName).toBe("Pase PRO");
    expect(pass.remainingMatches).toBe(6);
  });

  it("marks an expired pass even when it still has credits", () => {
    const pass = playerSubscriptionMapper.toDomain(
      rawPass({ endDate: PAST }),
      NOW
    );

    expect(pass.status).toBe("EXPIRED");
  });

  it("marks an active pass without credits as depleted", () => {
    const pass = playerSubscriptionMapper.toDomain(
      rawPass({ remainingMatches: 0 }),
      NOW
    );

    expect(pass.status).toBe("DEPLETED");
  });
});
