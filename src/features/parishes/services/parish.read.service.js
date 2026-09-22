/**
 * Parish Read Service — orchestrates repository + mapper.
 * Select-only feature — used for cascading dropdowns (municipality → parish).
 */

import { parishReadRepository } from "../repositories/parish.read.repository";
import { parishMapper } from "../mappers/parish.mapper";
import { logger } from "@/features/shared/lib/logger";
import { SHARED_CONFIG } from "@/features/shared";

/**
 * Fetches a paginated, filtered list of parishes.
 * @param {Object} params
 * @param {number} [params.municipalityId] - Optional filter by municipality.
 */
export async function fetchParishesList(params) {
  try {
    const result = await parishReadRepository.findMany(params);
    return {
      ...result,
      items: parishMapper.toDomainList(result.items),
    };
  } catch (error) {
    logger.error("Failed to fetch parishes list", { error: error.message });
    throw new Error("No se pudo obtener la lista de parroquias.");
  }
}
