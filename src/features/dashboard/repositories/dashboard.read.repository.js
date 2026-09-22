import prisma from "@/features/shared/lib/prisma";

/**
 * Read-only repository for dashboard aggregation queries.
 */
export const dashboardReadRepository = {
  async getStats() {
    const [courts, matches, openMatches, participants, activeSubscriptions] = await Promise.all([
      prisma.court.count({ where: { deletedAt: null } }),
      prisma.match.count({ where: { deletedAt: null } }),
      prisma.match.count({ where: { deletedAt: null, status: "OPEN" } }),
      prisma.participant.count(),
      prisma.userSubscription.count({ where: { isActive: true, deletedAt: null } }),
    ]);

    return { courts, matches, openMatches, participants, activeSubscriptions };
  },
};
