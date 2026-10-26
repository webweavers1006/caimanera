import prisma from "@/features/shared/lib/prisma";
import { playerSubscriptionMapper } from "../mappers/player-subscription.mapper";

export const playerSubscriptionReadRepository = {
  async findActive(userId) {
    const items = await prisma.userSubscription.findMany({
      where: {
        userId,
        isActive: true,
        deletedAt: null,
        endDate: { gte: new Date() },
        remainingMatches: { gt: 0 },
      },
      orderBy: { endDate: "asc" },
      include: { plan: true },
    });

    return playerSubscriptionMapper.toDomainList(items);
  },

  async findHistory(userId, { take = 50 } = {}) {
    const items = await prisma.userSubscription.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ createdAt: "desc" }, { startDate: "desc" }],
      take,
      include: { plan: true },
    });

    return playerSubscriptionMapper.toDomainList(items);
  },

  async findPlans() {
    return prisma.subscriptionPlan.findMany({
      where: { deletedAt: null },
      orderBy: { price: "asc" },
    });
  },

  async findPlanById(id) {
    return prisma.subscriptionPlan.findFirst({
      where: { id, deletedAt: null },
    });
  },

  async findPendingPurchases(userId) {
    return prisma.transaction.findMany({
      where: {
        userId,
        type: "SUBSCRIPTION_PURCHASE",
        status: "PENDING",
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  },
};
