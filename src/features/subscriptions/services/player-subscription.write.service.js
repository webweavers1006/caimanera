import { playerSubscriptionReadRepository } from "../repositories/player-subscription.read.repository";
import { playerSubscriptionWriteRepository } from "../repositories/player-subscription.write.repository";
import { SUBSCRIPTION_CONFIG } from "../config/subscription.constants";
import { PAYMENT_CONFIG } from "@/features/payments/config/payment.constants";
import { logger } from "@/features/shared/lib/logger";

function buildReference() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PASE-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

export async function purchaseSubscription({ planId, userId, method, reference }) {
  if (!planId || !userId || !method) {
    return { success: false, error: "Datos de compra inválidos." };
  }

  try {
    const plan = await playerSubscriptionReadRepository.findPlanById(planId);

    if (!plan) {
      return { success: false, error: "El plan seleccionado no está disponible." };
    }

    if (!Number.isFinite(Number(plan.price)) || Number(plan.price) <= 0) {
      return { success: false, error: "El plan no tiene un precio válido." };
    }

    const amountVes =
      PAYMENT_CONFIG.VES_RATE > 0
        ? Number(plan.price) * PAYMENT_CONFIG.VES_RATE
        : null;

    const durationDays =
      SUBSCRIPTION_CONFIG.DURATION_DAYS[plan.tier] ||
      SUBSCRIPTION_CONFIG.DURATION_DAYS.BASIC_PASS;

    const transaction = await playerSubscriptionWriteRepository.createPendingPurchase({
      userId,
      plan,
      method,
      reference: reference?.trim() || buildReference(),
      amountVes,
      durationDays,
    });

    return {
      success: true,
      transaction,
      message: SUBSCRIPTION_CONFIG.UI.PLAYER.PURCHASE.SUCCESS,
    };
  } catch (error) {
    logger.error("Failed to purchase subscription", {
      error: error.message,
      planId,
      userId,
    });
    return {
      success: false,
      error: SUBSCRIPTION_CONFIG.UI.PLAYER.PURCHASE.ERROR,
    };
  }
}
