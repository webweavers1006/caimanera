import { transactionReadRepository } from "../repositories/transaction.read.repository";
import { logger } from "@/features/shared/lib/logger";
import { SHARED_CONFIG } from "@/features/shared";

export async function fetchTransactionsList(params) {
  try {
    return await transactionReadRepository.findMany(params);
  } catch (error) {
    logger.error("Failed to fetch transactions list", { error: error.message });
    throw new Error(SHARED_CONFIG.UI.LABELS.MESSAGES.FETCH_LIST_ERROR);
  }
}

export async function fetchTransactionById(id) {
  try {
    if (!id) throw new Error("ID requerido");
    return await transactionReadRepository.findById(id);
  } catch (error) {
    logger.error("Failed to fetch transaction by id", {
      error: error.message,
      transactionId: id,
    });
    throw new Error("No se pudo obtener el pago.");
  }
}
