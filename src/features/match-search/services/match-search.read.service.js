import { publicCatalogReadRepository } from "@/features/shared/repositories/public-catalog.read.repository";
import { logger } from "@/features/shared/lib/logger";

/**
 * Read-only orchestration for `/partidos`.
 * Filters live in the URL and are applied on the client over this dataset.
 */
export async function fetchMatchSearchData({ currentUserId = null } = {}) {
  try {
    const [matches, courts, subscription] = await Promise.all([
      publicCatalogReadRepository.findUpcomingMatches(currentUserId),
      publicCatalogReadRepository.findPublicCourts(),
      publicCatalogReadRepository.findActiveSubscription(currentUserId),
    ]);

    return { matches, courts, subscription };
  } catch (error) {
    logger.error("Failed to load match search", { error: error.message });
    throw new Error("No se pudieron cargar los partidos.");
  }
}
