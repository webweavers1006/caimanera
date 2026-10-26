import { publicCatalogReadRepository } from "@/features/shared/repositories/public-catalog.read.repository";
import { logger } from "@/features/shared/lib/logger";

/**
 * Read-only orchestration for the player's private agenda: upcoming
 * enrollments plus the history of matches already played.
 *
 * The public catalog (home, search, detail, venues) has its own per-feature
 * services that reuse the shared `publicCatalogReadRepository`.
 */
export async function fetchMyMatches(userId) {
  try {
    const [upcoming, past] = await Promise.all([
      publicCatalogReadRepository.findMyUpcomingMatches(userId),
      publicCatalogReadRepository.findMyPastMatches(userId),
    ]);

    return { upcoming, past };
  } catch (error) {
    logger.error("Failed to load player matches", {
      error: error.message,
      userId,
    });
    throw new Error("No se pudieron cargar tus partidos.");
  }
}
