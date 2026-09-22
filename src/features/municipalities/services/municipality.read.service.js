/**
 * Municipality Read Service — orchestrates repository + mapper.
 * Select-only feature — used for cascading dropdowns (state → municipality → parish).
 */

import { municipalityReadRepository } from "../repositories/municipality.read.repository";
import { municipalityMapper } from "../mappers/municipality.mapper";
import { logger } from "@/features/shared/lib/logger";
import { SHARED_CONFIG } from "@/features/shared";

/**
 * Fetches a paginated, filtered list of municipalities.
 * @param {Object} params
 * @param {number} [params.stateId] - Optional filter by state.
 */
export async function fetchMunicipalitiesList(params) {
  try {
    const result = await municipalityReadRepository.findMany(params);
    return {
      ...result,
      items: municipalityMapper.toDomainList(result.items),
    };
  } catch (error) {
    logger.error("Failed to fetch municipalities list", { error: error.message });
    throw new Error("No se pudo obtener la lista de municipios.");
  }
}
