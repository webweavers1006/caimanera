import prisma from "@/features/shared/lib/prisma";
import { formatDateShort, formatTime } from "@/features/shared/lib/datetime";

/**
 * Read-only repository for dashboard aggregation queries.
 */
export const dashboardReadRepository = {
  async getStats() {
    const now = new Date();
    const [courts, matches, openMatches, participants, activeSubscriptions, upcomingMatches] =
      await Promise.all([
        prisma.court.count({ where: { deletedAt: null } }),
        prisma.match.count({ where: { deletedAt: null } }),
        prisma.match.count({
          where: {
            deletedAt: null,
            status: "OPEN",
            scheduledAt: { gte: now },
          },
        }),
        prisma.participant.count(),
        prisma.userSubscription.count({
          where: {
            isActive: true,
            deletedAt: null,
            endDate: { gte: now },
          },
        }),
        prisma.match.findMany({
          where: {
            deletedAt: null,
            status: { in: ["OPEN", "FULL"] },
            scheduledAt: { gte: now },
          },
          orderBy: { scheduledAt: "asc" },
          take: 5,
          include: {
            court: { select: { name: true } },
            participants: { select: { status: true } },
          },
        }),
      ]);

    return {
      courts,
      matches,
      openMatches,
      participants,
      activeSubscriptions,
      upcomingMatches: upcomingMatches.map((match) => {
        const confirmed = match.participants.filter((p) => p.status === "CONFIRMED").length;
        return {
          id: match.id,
          title: match.title,
          sport: match.sport,
          status: match.status,
          courtName: match.court?.name || "Sin cancha",
          dateLabel: formatDateShort(match.scheduledAt),
          timeLabel: formatTime(match.scheduledAt),
          confirmed,
          capacity: match.capacity,
          slotsLeft: Math.max(0, match.capacity - confirmed),
        };
      }),
    };
  },
};
