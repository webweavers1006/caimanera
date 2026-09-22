// TODO: Add "use cache" directive once cacheComponents flag is enabled in next.config.mjs
import { participantReadRepository } from "../repositories/participant.read.repository";
import { logger } from "@/features/shared/lib/logger";
import { SHARED_CONFIG } from "@/features/shared";

export async function fetchParticipantsList(params) {
  try {
    return await participantReadRepository.findMany(params);
  } catch (error) {
    logger.error("Failed to fetch participants list", { error: error.message });
    throw new Error(SHARED_CONFIG.UI.LABELS.MESSAGES.FETCH_LIST_ERROR);
  }
}

export async function fetchParticipantById(id) {
  try {
    if (!id) throw new Error("ID requerido");
    return await participantReadRepository.findById(id);
  } catch (error) {
    logger.error("Failed to fetch participant by id", { error: error.message, participantId: id });
    throw new Error("No se pudo obtener el registro.");
  }
}
