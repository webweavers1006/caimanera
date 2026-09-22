import { countryReadRepository } from "../repositories/country.read.repository";

export async function validateCountryRules(data, excludeId = null) {
  const existing = await countryReadRepository.findByName(data.name, excludeId);

  if (existing) {
    return {
      success: false,
      error: "Ya existe un registro con este nombre.",
      details: { name: ["Este nombre ya está en uso."] }
    };
  }

  return { success: true };
}
