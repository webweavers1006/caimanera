import { participantReadRepository } from "../repositories/participant.read.repository";
import { participantWriteRepository } from "../repositories/participant.write.repository";

/**
 * Cross-feature integration: enrolls a player in a match.
 * Exposes a clean API consumed by the matches feature — zero internal leaks.
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.matchId
 * @param {string} [params.status] - CONFIRMED | WAITLIST
 * @param {string} [params.paymentType] - PAY_PER_MATCH | SUBSCRIPTION_CREDIT
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function enrollPlayerInMatch({
  userId,
  matchId,
  status = "WAITLIST",
  paymentType = "PAY_PER_MATCH",
}) {
  const existing = await participantReadRepository.findByUserAndMatch(userId, matchId);
  if (existing) {
    return { success: false, error: "Ya estás inscrito en este partido." };
  }

  try {
    await participantWriteRepository.create({ userId, matchId, status, paymentType, position: null });
    return { success: true, message: "Inscripción realizada correctamente." };
  } catch (error) {
    return { success: false, error: "No se pudo realizar la inscripción." };
  }
}
