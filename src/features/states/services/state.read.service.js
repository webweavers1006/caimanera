/**
 * State Read Service — orchestrates repository + mapper for state queries.
 * Select-only feature — used for cascading dropdowns (country → state → municipality → parish).
 */

import { stateReadRepository } from "../repositories/state.read.repository";
import { stateMapper } from "../mappers/state.mapper";
import { logger } from "@/features/shared/lib/logger";
import { SHARED_CONFIG } from "@/features/shared";

/**
 * Fetches a paginated, filtered list of states.
 * @param {Object} params
 * @param {number} [params.page]
 * @param {number} [params.pageSize]
 * @param {string} [params.searchTerm]
 * @param {string} [params.sortKey]
 * @param {string} [params.sortDirection]
 * @param {number} [params.countryId]
 * @returns {Promise<{items: Array, totalCount: number, totalPages: number}>}
 */
export async function fetchStatesList(params) {
  try {
    const result = await stateReadRepository.findMany(params);
    return {
      ...result,
      items: stateMapper.toDomainList(result.items),
    };
  } catch (error) {
    logger.error("Failed to fetch states list", { error: error.message });
    throw new Error("No se pudo obtener la lista de estados.");
  }
}
