// TODO: Add "use cache" directive once cacheComponents flag is enabled in next.config.mjs
// (Next.js 16.2 throws at build time: 'To use "use cache", please enable the
//  feature flag `cacheComponents` in your Next.js config.')
import { matchReadRepository } from "../repositories/match.read.repository";
import { logger } from "@/features/shared/lib/logger";
import { SHARED_CONFIG } from "@/features/shared";

export async function fetchMatchesList(params) {
  try {
    return await matchReadRepository.findMany(params);
  } catch (error) {
    logger.error("Failed to fetch matches list", { error: error.message });
    throw new Error(SHARED_CONFIG.UI.LABELS.MESSAGES.FETCH_LIST_ERROR);
  }
}

export async function fetchMatchById(id, currentUserId = null) {
  try {
    if (!id) throw new Error("ID requerido");
    return await matchReadRepository.findById(id, currentUserId);
  } catch (error) {
    logger.error("Failed to fetch match by id", { error: error.message, matchId: id });
    throw new Error("No se pudo obtener el registro.");
  }
}

export async function fetchMatchDetail(id, currentUserId = null, includeParticipantNames = true) {
  try {
    if (!id) throw new Error("ID requerido");
    return await matchReadRepository.findByIdWithParticipants(id, currentUserId, includeParticipantNames);
  } catch (error) {
    logger.error("Failed to fetch match detail", { error: error.message, matchId: id });
    throw new Error("No se pudo obtener el detalle del partido.");
  }
}
