import { playerSubscriptionReadRepository } from "../repositories/player-subscription.read.repository";
import { subscriptionMapper } from "../mappers/subscription.mapper";
import { logger } from "@/features/shared/lib/logger";

/**
 * Read-only data for the player pass page: active pass, purchase history and
 * the plans currently on sale.
 */
export async function fetchPlayerPassData(userId) {
  try {
    const [activePasses, history, plans, pendingPurchases] = await Promise.all([
      playerSubscriptionReadRepository.findActive(userId),
      playerSubscriptionReadRepository.findHistory(userId),
      playerSubscriptionReadRepository.findPlans(),
      playerSubscriptionReadRepository.findPendingPurchases(userId),
    ]);

    return {
      active: activePasses[0] || null,
      activePasses,
      history,
      plans: subscriptionMapper.toDomainList(plans),
      pendingPurchases: pendingPurchases.map((purchase) => ({
        id: purchase.id,
        planName: purchase.metadata?.planName || "Pase",
        amount: purchase.amount,
        currency: purchase.currency,
        createdAt: purchase.createdAt,
      })),
    };
  } catch (error) {
    logger.error("Failed to load player pass data", {
      error: error.message,
      userId,
    });
    throw new Error("No se pudo cargar tu pase.");
  }
}
