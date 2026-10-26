import { discoveryReadRepository } from "../repositories/discovery.read.repository";
import { logger } from "@/features/shared/lib/logger";

/**
 * Read-only orchestration for the consumer discovery experience.
 */
export async function fetchDiscoveryData({ currentUserId = null } = {}) {
  try {
    return await discoveryReadRepository.findUpcomingMatches(currentUserId);
  } catch (error) {
    logger.error("Failed to load discovery data", { error: error.message });
    throw new Error("No se pudieron cargar los partidos cercanos.");
  }
}

export async function fetchMyUpcomingMatches(userId) {
  try {
    return await discoveryReadRepository.findMyUpcomingMatches(userId);
  } catch (error) {
    logger.error("Failed to load player upcoming matches", {
      error: error.message,
      userId,
    });
    throw new Error("No se pudieron cargar tus partidos.");
  }
}

export async function fetchActiveSubscription(userId) {
  try {
    return await discoveryReadRepository.findActiveSubscription(userId);
  } catch (error) {
    logger.error("Failed to load active subscription", { error: error.message });
    return null;
  }
}

export async function fetchPublicMatchDetail(id, currentUserId = null) {
  try {
    if (!id) return null;
    return await discoveryReadRepository.findPublicMatchById(id, currentUserId);
  } catch (error) {
    logger.error("Failed to load public match detail", {
      error: error.message,
      matchId: id,
    });
    throw new Error("No se pudo cargar el partido.");
  }
}
