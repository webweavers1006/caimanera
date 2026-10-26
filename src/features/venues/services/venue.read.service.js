import { publicCatalogReadRepository } from "@/features/shared/repositories/public-catalog.read.repository";
import { logger } from "@/features/shared/lib/logger";

/**
 * Read-only orchestration for the public venues module.
 */
export async function fetchVenueList() {
  try {
    return await publicCatalogReadRepository.findPublicCourts();
  } catch (error) {
    logger.error("Failed to load venues", { error: error.message });
    throw new Error("No se pudieron cargar las canchas.");
  }
}

export async function fetchVenueDetail(venueId, currentUserId = null) {
  try {
    if (!venueId) return null;
    return await publicCatalogReadRepository.findPublicCourtById(venueId, currentUserId);
  } catch (error) {
    logger.error("Failed to load venue detail", {
      error: error.message,
      venueId,
    });
    throw new Error("No se pudo cargar la cancha.");
  }
}
