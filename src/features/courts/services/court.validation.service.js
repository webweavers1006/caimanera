import { courtReadRepository } from "../repositories/court.read.repository";

export async function validateCourtRules(data, excludeId = null) {
  const existing = await courtReadRepository.findByName(data.name, excludeId);

  if (existing) {
    return {
      success: false,
      error: "Ya existe una cancha con este nombre.",
      details: { name: ["Este nombre ya está en uso."] }
    };
  }

  return { success: true };
}
