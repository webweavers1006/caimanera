import prisma from "@/features/shared/lib/prisma";
import { discoveryMapper } from "../mappers/discovery.mapper";
import { DISCOVERY_CONFIG } from "../config/discovery.constants";

const UPCOMING_STATUSES = ["OPEN", "FULL", "IN_PROGRESS"];

const PHOTO_SELECT = {
  where: { deletedAt: null },
  orderBy: { sortOrder: "asc" },
  select: { url: true },
};

const PUBLIC_MATCH_INCLUDE = {
  host: { select: { firstName: true } },
  court: {
    select: {
      id: true,
      name: true,
      address: true,
      sport: true,
      latitude: true,
      longitude: true,
      photos: PHOTO_SELECT,
    },
  },
  participants: {
    select: { userId: true, status: true },
  },
};

/**
 * Read-only repository for the public discovery home.
 * Only exposes fields that are safe for anonymous visitors.
 */
export const discoveryReadRepository = {
  async findUpcomingMatches(currentUserId = null) {
    const now = new Date();

    const [matches, courts, subscription] = await Promise.all([
      prisma.match.findMany({
        where: {
          deletedAt: null,
          status: { in: UPCOMING_STATUSES },
          scheduledAt: { gte: now },
          court: { is: { deletedAt: null, isActive: true } },
        },
        orderBy: { scheduledAt: "asc" },
        take: DISCOVERY_CONFIG.MAX_DISCOVERY_MATCHES,
        include: PUBLIC_MATCH_INCLUDE,
      }),
      prisma.court.findMany({
        where: { deletedAt: null, isActive: true },
        orderBy: { name: "asc" },
        include: {
          photos: PHOTO_SELECT,
          matches: {
            where: {
              deletedAt: null,
              status: { in: UPCOMING_STATUSES },
              scheduledAt: { gte: now },
            },
            select: { id: true },
          },
        },
      }),
      currentUserId
        ? prisma.userSubscription.findFirst({
            where: {
              userId: currentUserId,
              isActive: true,
              deletedAt: null,
              endDate: { gte: now },
            },
            orderBy: { endDate: "desc" },
            include: { plan: { select: { name: true, tier: true } } },
          })
        : null,
    ]);

    return {
      matches: discoveryMapper.toPublicMatchList(matches, currentUserId),
      courts: discoveryMapper.toPublicCourtList(courts),
      subscription: discoveryMapper.toSubscription(subscription),
    };
  },

  async findActiveSubscription(userId) {
    if (!userId) return null;

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        isActive: true,
        deletedAt: null,
        endDate: { gte: new Date() },
      },
      orderBy: { endDate: "desc" },
      include: { plan: { select: { name: true, tier: true } } },
    });

    return discoveryMapper.toSubscription(subscription);
  },

  /**
   * Upcoming matches the player is enrolled in (confirmed or waitlisted).
   * Past, completed and canceled matches are intentionally excluded.
   */
  async findMyUpcomingMatches(userId) {
    if (!userId) return [];

    const now = new Date();

    const matches = await prisma.match.findMany({
      where: {
        deletedAt: null,
        status: { in: UPCOMING_STATUSES },
        scheduledAt: { gte: now },
        participants: { some: { userId } },
        court: { is: { deletedAt: null } },
      },
      orderBy: { scheduledAt: "asc" },
      include: PUBLIC_MATCH_INCLUDE,
    });

    return discoveryMapper.toPublicMatchList(matches, userId);
  },

  async findPublicMatchById(id, currentUserId = null) {
    const match = await prisma.match.findFirst({
      where: {
        id,
        deletedAt: null,
        court: { is: { deletedAt: null } },
      },
      include: {
        ...PUBLIC_MATCH_INCLUDE,
        court: {
          select: {
            id: true,
            name: true,
            description: true,
            address: true,
            sport: true,
            latitude: true,
            longitude: true,
            hourlyRate: true,
            manager: { select: { firstName: true, lastName: true } },
            photos: PHOTO_SELECT,
          },
        },
      },
    });

    return discoveryMapper.toPublicMatchDetail(match, currentUserId);
  },
};
