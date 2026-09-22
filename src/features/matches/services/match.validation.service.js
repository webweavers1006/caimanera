import { matchReadRepository } from "../repositories/match.read.repository";

export async function validateMatchRules(data, excludeId = null) {
  const conflict = await matchReadRepository.findByCourtAndStart(
    data.courtId,
    data.scheduledAt,
    excludeId
  );

  if (conflict) {
    return {
      success: false,
      error: "Ya existe un partido programado a esta hora en la misma cancha.",
      details: {
        scheduledAt: ["Ya hay un partido en esta cancha a esta hora."],
      },
    };
  }

  return { success: true };
}
