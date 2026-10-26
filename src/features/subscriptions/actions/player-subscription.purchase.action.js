"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/features/shared";
import { createProtectedAction } from "@/features/shared/lib/safe-action";
import { SUBSCRIPTION_CONFIG } from "../config/subscription.constants";
import { TRANSACTION_CONFIG } from "@/features/transactions/config/transaction.constants";
import { subscriptionPurchaseSchema } from "../schemas/subscription.purchase.schema";
import { purchaseSubscription } from "../services/player-subscription.write.service";

function revalidatePassPaths() {
  revalidatePath(ROUTES.PLAYER.HOME.path);
  revalidatePath(ROUTES.PLAYER.ACCOUNT.path);
  revalidatePath(ROUTES.PLAYER.PASSES.path);
  revalidatePath(ROUTES.PLAYER.PAYMENTS.path);
  revalidatePath(TRANSACTION_CONFIG.PATH);
}

export const purchaseSubscriptionAction = createProtectedAction(
  SUBSCRIPTION_CONFIG.PERMISSIONS.PURCHASE,
  subscriptionPurchaseSchema,
  async (data, session) => {
    const result = await purchaseSubscription({
      planId: data.planId,
      userId: session.id,
      method: data.method,
      reference: data.reference,
    });

    if (result.success) revalidatePassPaths();
    return result;
  }
);
