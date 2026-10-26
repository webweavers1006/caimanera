import { participantReadRepository } from "../repositories/participant.read.repository";
import { getMatchEnrollmentSnapshot } from "@/features/matches/services/match.integration.service";

export async function validateParticipantRules(data, excludeId = null) {
  const match = await getMatchEnrollmentSnapshot(data.matchId);

  if (!match) {
    return {
      success: false,
      error: "El partido no existe.",
      details: { matchId: ["Selecciona un partido válido."] },
    };
  }

  if (match.isPast || !["OPEN", "FULL"].includes(match.rawStatus)) {
    return {
      success: false,
      error: "Este partido ya no acepta inscripciones.",
      details: { matchId: ["El partido está finalizado, cancelado o en curso."] },
    };
  }

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

  if (data.status === "CONFIRMED") {
    const confirmed = await participantReadRepository.countConfirmedByMatch(
      data.matchId,
      excludeId
    );

    if (confirmed >= match.capacity) {
      return {
        success: false,
        error: "El partido está lleno. Registra al jugador en lista de espera.",
        details: {
          status: ["No hay cupos confirmados disponibles en este partido."],
        },
      };
    }
  }

  return { success: true };
}
