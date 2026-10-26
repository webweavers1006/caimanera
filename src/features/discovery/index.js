// ⚠️ Safe barrel: only config/constants and pure client-safe helpers.
// Server-only functions must be imported by direct path.
export { DISCOVERY_CONFIG, getSportEmoji } from "./config/discovery.constants";
export { distanceInKm, formatDistance, estimateMinutes } from "./lib/geo";
