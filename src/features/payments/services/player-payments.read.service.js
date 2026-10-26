import { playerPaymentsReadRepository } from "../repositories/player-payments.read.repository";
import { logger } from "@/features/shared/lib/logger";

export async function fetchPlayerPayments(userId) {
  try {
    return await playerPaymentsReadRepository.findByUser(userId);
  } catch (error) {
    logger.error("Failed to load player payments", {
      error: error.message,
      userId,
    });
    throw new Error("No se pudieron cargar tus pagos.");
  }
}
