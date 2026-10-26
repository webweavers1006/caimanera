/**
 * Emoji used as a lightweight sport badge across the public surfaces.
 */
export function getSportEmoji(sport) {
  const value = String(sport || "").toLowerCase();
  if (value.includes("fútbol") || value.includes("futbol")) return "⚽";
  if (value.includes("pádel") || value.includes("padel")) return "🎾";
  if (value.includes("tenis")) return "🎾";
  if (value.includes("béisbol") || value.includes("beisbol")) return "⚾";
  if (value.includes("basket") || value.includes("baloncesto")) return "🏀";
  if (value.includes("volei") || value.includes("vólei")) return "🏐";
  return "🏟️";
}
