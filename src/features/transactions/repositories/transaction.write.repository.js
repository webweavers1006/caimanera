import prisma from "@/features/shared/lib/prisma";
import { SUBSCRIPTION_CONFIG } from "@/features/subscriptions/config/subscription.constants";

function readMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

function durationDaysForTier(tier) {
  return SUBSCRIPTION_CONFIG.DURATION_DAYS[tier] || 30;
}

export const transactionWriteRepository = {
  /**
   * Confirms a pending payment.
   *
   * Match payments only change status. A pass purchase also activates (or
   * renews) the player's subscription inside the same database transaction, so
   * a payment can never be marked completed without its pass being credited.
   */
  async confirm({ transactionId, confirmedBy = null }) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        where: { id: transactionId, deletedAt: null },
      });

      if (!transaction) {
        return { success: false, error: "El pago no existe." };
      }

      if (transaction.status !== "PENDING") {
        return {
          success: false,
          error: "El pago ya fue procesado.",
          code: "NOT_PENDING",
        };
      }

      let subscription = null;

      if (transaction.type === "SUBSCRIPTION_PURCHASE") {
        const metadata = readMetadata(transaction.metadata);
        const planId = metadata.planId;

        if (!planId) {
          return {
            success: false,
            error: "La compra no tiene un plan asociado.",
          };
        }

        const plan = await tx.subscriptionPlan.findFirst({
          where: { id: planId, deletedAt: null },
        });

        if (!plan) {
          return {
            success: false,
            error: "El plan del pase ya no está disponible.",
          };
        }

        const durationDays =
          Number(metadata.durationDays) || durationDaysForTier(plan.tier);
        const now = new Date();

        const active = await tx.userSubscription.findFirst({
          where: {
            userId: transaction.userId,
            planId: plan.id,
            isActive: true,
            deletedAt: null,
            endDate: { gte: now },
          },
          orderBy: { endDate: "desc" },
        });

        if (active) {
          subscription = await tx.userSubscription.update({
            where: { id: active.id },
            data: {
              isActive: true,
              remainingMatches: { increment: plan.matchesIncluded },
              endDate: new Date(
                active.endDate.getTime() + durationDays * 24 * 60 * 60 * 1000
              ),
            },
          });
        } else {
          subscription = await tx.userSubscription.create({
            data: {
              userId: transaction.userId,
              planId: plan.id,
              startDate: now,
              endDate: new Date(
                now.getTime() + durationDays * 24 * 60 * 60 * 1000
              ),
              isActive: true,
              remainingMatches: plan.matchesIncluded,
            },
          });
        }
      }

      const metadata = readMetadata(transaction.metadata);
      const updated = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "COMPLETED",
          metadata: {
            ...metadata,
            confirmedAt: new Date().toISOString(),
            ...(confirmedBy ? { confirmedBy } : {}),
          },
        },
      });

      return { success: true, transaction: updated, subscription };
    });
  },
};
