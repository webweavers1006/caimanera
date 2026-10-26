import { describe, it, expect } from "vitest";
import { matchSchema } from "@/features/matches/schemas/match.schema";

const base = {
  title: "Partido de prueba",
  sport: "Fútbol 5",
  durationMins: 60,
  capacity: 10,
  pricePerSlot: 5,
  allowSubscription: true,
  hostId: "host-1",
  courtId: "court-1",
};

describe("matchSchema", () => {
  it("accepts a future match and stores it as UTC ISO", () => {
    const result = matchSchema.safeParse({
      ...base,
      scheduledAt: "2099-05-01T18:00",
      status: "OPEN",
    });

    expect(result.success).toBe(true);
    expect(result.data.scheduledAt.endsWith("Z")).toBe(true);
  });

  it("rejects a past match that is still open", () => {
    const result = matchSchema.safeParse({
      ...base,
      scheduledAt: "2020-01-01T18:00",
      status: "OPEN",
    });

    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors.scheduledAt?.length).toBeGreaterThan(0);
  });

  it("allows closing a historical match", () => {
    const result = matchSchema.safeParse({
      ...base,
      scheduledAt: "2020-01-01T18:00",
      status: "COMPLETED",
    });

    expect(result.success).toBe(true);
  });
});
