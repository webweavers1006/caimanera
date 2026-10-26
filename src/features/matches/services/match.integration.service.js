import { matchReadRepository } from "../repositories/match.read.repository";

/**
 * Cross-feature integration surface for the participants module.
 * Returns a safe snapshot for enrollment validation without leaking the
 * match repository into the participants feature.
 */
export async function getMatchEnrollmentSnapshot(matchId) {
  return matchReadRepository.findById(matchId);
}
