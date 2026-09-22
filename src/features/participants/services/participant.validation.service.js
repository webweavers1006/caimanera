import { participantReadRepository } from "../repositories/participant.read.repository";

export async function validateParticipantRules(data, excludeId = null) {
  const existing = await participantReadRepository.findByUserAndMatch(
    data.userId,
    data.matchId,
    excludeId
  );

  if (existing) {
    return {
      success: false,
      error: "El jugador ya está inscrito en este partido.",
      details: {
        userId: ["El jugador ya está inscrito en este partido."],
      },
    };
  }

  return { success: true };
}
