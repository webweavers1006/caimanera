import { matchReadRepository } from "../repositories/match.read.repository";
import { enrollPlayerInMatch } from "@/features/participants/services/participant.integration.service";

/**
 * Enrolls the current user in a match, deciding status by capacity.
 */
export async function enrollCurrentUserInMatch(matchId, userId) {
  const match = await matchReadRepository.findByIdWithParticipants(matchId);
  if (!match) {
    return { success: false, error: "El partido no existe." };
  }

  const confirmed = (match.participants || []).filter((p) => p.status === "CONFIRMED").length;
  const status = confirmed < match.capacity ? "CONFIRMED" : "WAITLIST";

  return enrollPlayerInMatch({ userId, matchId, status, paymentType: "PAY_PER_MATCH" });
}
