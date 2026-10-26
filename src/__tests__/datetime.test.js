import { describe, it, expect } from "vitest";
import {
  daysFromToday,
  formatDateShort,
  formatTime,
  toZonedInputValue,
  zonedDateKey,
  zonedLocalToDate,
  zonedLocalToISO,
} from "@/features/shared/lib/datetime";

describe("business timezone helpers", () => {
  it("interprets datetime-local values in America/Caracas", () => {
    const date = zonedLocalToDate("2026-10-25T18:30");
    expect(date.toISOString()).toBe("2026-10-25T22:30:00.000Z");
  });

  it("keeps ISO values untouched", () => {
    expect(zonedLocalToISO("2026-10-25T22:30:00.000Z")).toBe(
      "2026-10-25T22:30:00.000Z"
    );
  });

  it("round-trips the datetime-local input value", () => {
    const iso = zonedLocalToISO("2026-07-01T09:00");
    expect(toZonedInputValue(iso)).toBe("2026-07-01T09:00");
  });

  it("formats dates and times in Spanish", () => {
    const date = new Date("2026-10-25T22:30:00.000Z");
    expect(formatDateShort(date)).toContain("25");
    expect(formatTime(date)).toContain("6:30");
    expect(zonedDateKey(date)).toBe("2026-10-25");
  });

  it("counts calendar days from today", () => {
    const today = new Date();
    expect(daysFromToday(today)).toBe(0);
  });
});
