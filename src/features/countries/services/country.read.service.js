import { countryReadRepository } from "../repositories/country.read.repository";
import { logger } from "@/features/shared/lib/logger";
import { SHARED_CONFIG } from "@/features/shared";

export async function fetchCountriesList(params) {
  try {
    return await countryReadRepository.findMany(params);
  } catch (error) {
    logger.error("Failed to fetch countries list", { error: error.message });
    throw new Error(SHARED_CONFIG.UI.LABELS.MESSAGES.FETCH_LIST_ERROR);
  }
}

export async function fetchCountryById(id) {
  try {
    if (!id) throw new Error("ID requerido");
    return await countryReadRepository.findById(id);
  } catch (error) {
    logger.error("Failed to fetch country by id", { error: error.message, countryId: id });
    throw new Error("No se pudo obtener el registro.");
  }
}
