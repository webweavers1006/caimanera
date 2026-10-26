import { publicCatalogReadRepository } from "@/features/shared/repositories/public-catalog.read.repository";
import { logger } from "@/features/shared/lib/logger";

/**
 * Read-only orchestration for the player home.
 *
 * Home is intentionally small: the player's next matches and the venues that
 * can be discovered from the app. Match searching lives in `/partidos`.
 */
export async function fetchHomeData({ userId = null } = {}) {
  try {
    const [courts, matches] = await Promise.all([
      publicCatalogReadRepository.findPublicCourts(),
      userId
        ? publicCatalogReadRepository.findMyUpcomingMatches(userId, { take: 3 })
        : [],
    ]);

    return { courts, matches };
  } catch (error) {
    logger.error("Failed to load player home", { error: error.message, userId });
    throw new Error("No se pudo cargar el inicio.");
  }
}
