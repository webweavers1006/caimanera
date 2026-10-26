import prisma from "@/features/shared/lib/prisma";

export const playerSubscriptionWriteRepository = {
  async createPendingPurchase({
    userId,
    plan,
    method,
    reference,
    amountVes,
    durationDays,
  }) {
    return prisma.transaction.create({
      data: {
        userId,
        matchId: null,
        amount: plan.price,
        amountVes,
        currency: "USD",
        type: "SUBSCRIPTION_PURCHASE",
        method,
        status: "PENDING",
        reference,
        metadata: {
          source: "player_pass_purchase",
          planId: plan.id,
          planName: plan.name,
          tier: plan.tier,
          durationDays,
        },
      },
      select: {
        id: true,
        status: true,
        method: true,
        reference: true,
        amount: true,
        amountVes: true,
        currency: true,
        createdAt: true,
      },
    });
  },
};
