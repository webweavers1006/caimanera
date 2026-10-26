import { matchEnrollmentRepository } from "@/features/matches/repositories/match.enrollment.repository";

/**
 * Confirms a public enrollment through the checkout flow.
 * Capacity, subscription balance and transaction creation are resolved
 * atomically inside the enrollment repository.
 */
export async function payAndEnrollCurrentUserInMatch({
  matchId,
  userId,
  method,
  reference,
  staffBypass = false,
}) {
  if (!matchId || !userId || !method) {
    return { success: false, error: "Datos de pago inválidos." };
  }

  return matchEnrollmentRepository.enroll({
    matchId,
    userId,
    paymentMethod: method,
    reference,
    staffBypass,
  });
}
