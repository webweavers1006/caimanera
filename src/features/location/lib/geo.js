/**
 * Geographic helpers for the discovery experience.
 * Distance math is delegated to `geolib` instead of reimplementing Haversine.
 */

import { findNearest, getDistance } from "geolib";

function toPoint(point) {
  if (!point) return null;
  const latitude = Number(point.latitude ?? point.lat);
  const longitude = Number(point.longitude ?? point.lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

/**
 * Distance in kilometers between two coordinates.
 *
 * @param {{latitude:number,longitude:number}} from
 * @param {{latitude:number,longitude:number}} to
 * @returns {number|null}
 */
export function distanceInKm(from, to) {
  const a = toPoint(from);
  const b = toPoint(to);
  if (!a || !b) return null;
  return getDistance(a, b) / 1000;
}

/**
 * Human-readable distance: "850 m" / "2,4 km".
 */
export function formatDistance(km) {
  if (km == null || !Number.isFinite(km)) return null;
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`;

  const value = new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: km < 10 ? 1 : 0,
    maximumFractionDigits: km < 10 ? 1 : 0,
  }).format(km);

  return `${value} km`;
}

/**
 * Rough urban driving estimate, used as a friendly secondary hint.
 */
export function estimateMinutes(km, speedKmH = 24) {
  if (km == null || !Number.isFinite(km)) return null;
  return Math.max(2, Math.round((km / speedKmH) * 60));
}

/**
 * Sorts items by distance to a center and attaches `distanceKm`.
 * Items without valid coordinates go last.
 */
export function orderByDistanceKm(items, center) {
  const origin = toPoint(center);
  if (!origin) return items || [];

  const valid = [];
  const invalid = [];

  for (const item of items || []) {
    const point = toPoint(item?.court || item);
    if (!point) {
      invalid.push(item);
      continue;
    }
    valid.push({
      item,
      distance: getDistance(origin, point),
    });
  }

  valid.sort((a, b) => a.distance - b.distance);

  return [
    ...valid.map((entry) => ({
      ...entry.item,
      distanceKm: entry.distance / 1000,
    })),
    ...invalid,
  ];
}

/**
 * Nearest item to a center, or null when the list has no valid coordinates.
 */
export function findNearestItem(items, center) {
  const origin = toPoint(center);
  if (!origin) return null;

  const candidates = (items || [])
    .map((item) => ({ item, point: toPoint(item?.court || item) }))
    .filter((entry) => entry.point);

  if (candidates.length === 0) return null;

  const nearest = findNearest(
    origin,
    candidates.map((entry) => entry.point)
  );

  const match = candidates.find(
    (entry) =>
      entry.point.latitude === nearest.latitude &&
      entry.point.longitude === nearest.longitude
  );

  return match
    ? { ...match.item, distanceKm: getDistance(origin, match.point) / 1000 }
    : null;
}

/**
 * Returns a stable center for a list of matches/courts.
 */
export function getMapCenter(items, fallback = { latitude: 10.4806, longitude: -66.9036 }) {
  const points = (items || [])
    .map((item) => toPoint(item?.court || item))
    .filter(Boolean);

  if (points.length === 0) return toPoint(fallback);

  const sum = points.reduce(
    (acc, point) => ({
      latitude: acc.latitude + point.latitude,
      longitude: acc.longitude + point.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: sum.latitude / points.length,
    longitude: sum.longitude / points.length,
  };
}

/**
 * Normalizes a location object coming from localStorage/geolocation.
 */
export function normalizeLocation(value) {
  const point = toPoint(value);
  if (!point) return null;

  return {
    label: value.label || "Mi ubicación",
    latitude: point.latitude,
    longitude: point.longitude,
    source: value.source || "manual",
  };
}

export { toPoint };
