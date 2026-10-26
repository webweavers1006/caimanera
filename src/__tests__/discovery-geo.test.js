import { describe, it, expect } from "vitest";
import {
  distanceInKm,
  formatDistance,
  orderByDistanceKm,
  getMapCenter,
} from "@/features/discovery/lib/geo";

const CARACAS = { latitude: 10.4806, longitude: -66.9036 };
const CHACAO = { latitude: 10.4961, longitude: -66.8537 };

describe("discovery geo helpers", () => {
  it("calculates distance in kilometers", () => {
    const km = distanceInKm(CARACAS, CHACAO);
    expect(km).toBeGreaterThan(5);
    expect(km).toBeLessThan(7);
  });

  it("returns null for invalid coordinates", () => {
    expect(distanceInKm(CARACAS, { latitude: null, longitude: null })).toBeNull();
  });

  it("formats short and long distances", () => {
    expect(formatDistance(0.85)).toBe("850 m");
    expect(formatDistance(2.44)).toBe("2,4 km");
    expect(formatDistance(null)).toBeNull();
  });

  it("orders items by distance and attaches distanceKm", () => {
    const items = [
      { id: "far", court: { latitude: 10.6, longitude: -66.9 } },
      { id: "near", court: CHACAO },
    ];
    const ordered = orderByDistanceKm(items, CARACAS);
    expect(ordered[0].id).toBe("near");
    expect(ordered[0].distanceKm).toBeGreaterThan(0);
  });

  it("computes a center for a set of matches", () => {
    const center = getMapCenter([
      { court: CARACAS },
      { court: { latitude: 10.5, longitude: -66.9 } },
    ]);
    expect(center.latitude).toBeCloseTo(10.4903, 3);
    expect(center.longitude).toBeCloseTo(-66.9018, 3);
  });
});
