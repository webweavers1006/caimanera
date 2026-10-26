"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/features/shared";
import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { TRANSACTION_CONFIG } from "../config/transaction.constants";
import { confirmTransaction } from "../services/transaction.confirmation.service";

function revalidatePaymentPaths() {
  revalidatePath(TRANSACTION_CONFIG.PATH);
  revalidatePath(ROUTES.PLAYER.HOME.path);
  revalidatePath(ROUTES.PLAYER.ACCOUNT.path);
  revalidatePath(ROUTES.PLAYER.PASSES.path);
  revalidatePath(ROUTES.PLAYER.PAYMENTS.path);
}

export const confirmTransactionAction = createProtectedFunction(
  TRANSACTION_CONFIG.PERMISSIONS.UPDATE,
  async (transactionId, session) => {
    const result = await confirmTransaction({
      transactionId,
      confirmedBy: session?.id || null,
    });

    if (result.success) revalidatePaymentPaths();
    return result;
  }
);
