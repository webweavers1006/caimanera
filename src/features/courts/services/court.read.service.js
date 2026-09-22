// TODO: Add "use cache" directive once cacheComponents flag is enabled in next.config.mjs
// (Next.js 16.2 throws at build time: 'To use "use cache", please enable the
//  feature flag `cacheComponents` in your Next.js config.')
import { courtReadRepository } from "../repositories/court.read.repository";
import { logger } from "@/features/shared/lib/logger";
import { SHARED_CONFIG } from "@/features/shared";

export async function fetchCourtsList(params) {
  try {
    return await courtReadRepository.findMany(params);
  } catch (error) {
    logger.error("Failed to fetch courts list", { error: error.message });
    throw new Error(SHARED_CONFIG.UI.LABELS.MESSAGES.FETCH_LIST_ERROR);
  }
}

export async function fetchCourtById(id) {
  try {
    if (!id) throw new Error("ID requerido");
    return await courtReadRepository.findById(id);
  } catch (error) {
    logger.error("Failed to fetch court by id", { error: error.message, courtId: id });
    throw new Error("No se pudo obtener el registro.");
  }
}
