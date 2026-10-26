import { matchEnrollmentRepository } from "../repositories/match.enrollment.repository";

/**
 * Enrolls the current user in a match.
 * All capacity/payment/re-enrollment rules are resolved atomically in the
 * repository transaction; this layer only exposes the use case.
 */
export async function enrollCurrentUserInMatch(matchId, userId) {
  if (!matchId || !userId) {
    return { success: false, error: "Datos de inscripción inválidos." };
  }

  return matchEnrollmentRepository.enroll({ matchId, userId });
}

/**
 * Cancels the current user's enrollment and promotes the next waitlisted
 * player when a confirmed slot is freed.
 */
export async function leaveCurrentUserFromMatch(matchId, userId) {
  if (!matchId || !userId) {
    return { success: false, error: "Datos de inscripción inválidos." };
  }

  return matchEnrollmentRepository.leave({ matchId, userId });
}
