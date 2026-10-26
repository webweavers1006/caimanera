/**
 * Server-side address geocoding backed by OpenStreetMap Nominatim.
 * Used only by the public location picker; results are cached in memory.
 */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const CACHE_TTL_MS = 5 * 60 * 1000;
const USER_AGENT =
  "Caimanera/1.0 (localizador de canchas; contacto: soporte@caimanera.app)";

const cache = new Map();

function readCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function writeCache(key, data) {
  if (cache.size > 250) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { createdAt: Date.now(), data });
}

function compactLabel(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

export async function searchAddresses(query) {
  const key = `search:${query.toLowerCase()}`;
  const cached = readCache(key);
  if (cached) return cached;

  const url = new URL(`${NOMINATIM_BASE}/search`);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "ve");
  url.searchParams.set("accept-language", "es");

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(7000),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Geocoder responded ${response.status}`);

  const payload = await response.json();
  const results = (Array.isArray(payload) ? payload : [])
    .map((item) => ({
      label: compactLabel(item.name || item.display_name),
      subtitle: compactLabel(item.display_name),
      latitude: Number(item.lat),
      longitude: Number(item.lon),
    }))
    .filter(
      (item) =>
        Number.isFinite(item.latitude) &&
        Number.isFinite(item.longitude) &&
        item.label
    );

  writeCache(key, results);
  return results;
}

export async function reverseGeocode(latitude, longitude) {
  const key = `reverse:${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  const cached = readCache(key);
  if (cached) return cached;

  const url = new URL(`${NOMINATIM_BASE}/reverse`);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("zoom", "16");
  url.searchParams.set("accept-language", "es");

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(7000),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Geocoder responded ${response.status}`);

  const payload = await response.json();
  const address = payload?.address || {};
  const shortName =
    address.suburb ||
    address.neighbourhood ||
    address.city_district ||
    address.city ||
    address.town ||
    address.village ||
    payload?.name;

  const label = compactLabel(
    [shortName, address.city || address.state].filter(Boolean).join(", ") ||
      payload?.display_name
  );

  const result = label || null;
  writeCache(key, result);
  return result;
}
