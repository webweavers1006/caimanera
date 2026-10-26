import { publicCatalogReadRepository } from "@/features/shared/repositories/public-catalog.read.repository";
import { logger } from "@/features/shared/lib/logger";

/**
 * Read-only orchestration for the player's private agenda.
 *
 * The public catalog (home, search, detail, venues) has its own per-feature
 * services that reuse the shared `publicCatalogReadRepository`.
 */
export async function fetchMyUpcomingMatches(userId) {
  try {
    return await publicCatalogReadRepository.findMyUpcomingMatches(userId);
  } catch (error) {
    logger.error("Failed to load player upcoming matches", {
      error: error.message,
      userId,
    });
    throw new Error("No se pudieron cargar tus partidos.");
  }
}
