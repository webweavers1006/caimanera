import { publicCatalogReadRepository } from "@/features/shared/repositories/public-catalog.read.repository";
import { logger } from "@/features/shared/lib/logger";

/**
 * Read-only orchestration for the canonical public match detail.
 */
export async function fetchMatchDetailPageData(matchId, currentUserId = null) {
  try {
    const [match, subscription] = await Promise.all([
      publicCatalogReadRepository.findPublicMatchById(matchId, currentUserId),
      publicCatalogReadRepository.findActiveSubscription(currentUserId),
    ]);

    return { match, subscription };
  } catch (error) {
    logger.error("Failed to load public match detail page", {
      error: error.message,
      matchId,
    });
    throw new Error("No se pudo cargar el partido.");
  }
}
