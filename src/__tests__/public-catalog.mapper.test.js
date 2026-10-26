import { describe, it, expect } from "vitest";
import { publicCatalogMapper } from "@/features/shared/mappers/public-catalog.mapper";

const PAST = "2020-01-01T12:00:00.000Z";
const FUTURE = "2999-01-01T12:00:00.000Z";

function rawMatch(overrides = {}) {
  return {
    id: "match-1",
    title: "Fútbol 7 en Chacao",
    sport: "Fútbol 7",
    status: "OPEN",
    scheduledAt: FUTURE,
    durationMins: 60,
    capacity: 10,
    pricePerSlot: 5,
    allowSubscription: false,
    host: { firstName: "Ana" },
    court: {
      id: "court-1",
      name: "Cancha Chacao",
      address: "Chacao",
      sport: "Fútbol 7",
      latitude: 10.4961,
      longitude: -66.8537,
      photos: [],
    },
    participants: [],
    ...overrides,
  };
}

describe("public catalog mapper", () => {
  it("keeps an upcoming match open and available", () => {
    const match = publicCatalogMapper.toPublicMatch(rawMatch());

    expect(match.status).toBe("OPEN");
    expect(match.isPast).toBe(false);
    expect(match.isEnrolled).toBe(false);
    expect(match.slotsLeft).toBe(10);
  });

  it("resolves a past match as completed for the history", () => {
    const match = publicCatalogMapper.toPublicMatch(
      rawMatch({
        scheduledAt: PAST,
        participants: [{ userId: "player-1", status: "CONFIRMED" }],
      }),
      "player-1"
    );

    expect(match.status).toBe("COMPLETED");
    expect(match.isPast).toBe(true);
    expect(match.isEnrolled).toBe(true);
    expect(match.myStatus).toBe("CONFIRMED");
  });

  it("keeps a canceled match canceled even if it is already past", () => {
    const match = publicCatalogMapper.toPublicMatch(
      rawMatch({ scheduledAt: PAST, status: "CANCELED" })
    );

    expect(match.status).toBe("CANCELED");
    expect(match.rawStatus).toBe("CANCELED");
  });
});
