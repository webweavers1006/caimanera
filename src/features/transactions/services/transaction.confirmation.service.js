import { transactionWriteRepository } from "../repositories/transaction.write.repository";
import { logger } from "@/features/shared/lib/logger";

/**
 * Confirms a pending transaction. For pass purchases the repository also
 * activates or renews the player's subscription atomically.
 */
export async function confirmTransaction({ transactionId, confirmedBy = null }) {
  if (!transactionId) {
    return { success: false, error: "Pago inválido." };
  }

  try {
    return await transactionWriteRepository.confirm({
      transactionId,
      confirmedBy,
    });
  } catch (error) {
    logger.error("Failed to confirm transaction", {
      error: error.message,
      transactionId,
    });
    return {
      success: false,
      error: "No se pudo confirmar el pago. Intenta nuevamente.",
    };
  }
}
