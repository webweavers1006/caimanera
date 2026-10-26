import prisma from "@/features/shared/lib/prisma";
import { publicCatalogMapper } from "@/features/shared/mappers/public-catalog.mapper";

const UPCOMING_STATUSES = ["OPEN", "FULL", "IN_PROGRESS"];
const MAX_PUBLIC_MATCHES = 200;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return typeof value === "string" && UUID_RE.test(value);
}

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

const upcomingMatchWhere = (now = new Date()) => ({
  deletedAt: null,
  status: { in: UPCOMING_STATUSES },
  scheduledAt: { gte: now },
});

/**
 * Shared read-only repository for the player-facing public catalog.
 * It only exposes fields that are safe for anonymous visitors.
 *
 * Feature modules (home, match-search, match-detail, venues) own their read
 * services and delegate here instead of importing another feature's repository.
 */
export const publicCatalogReadRepository = {
  async findUpcomingMatches(currentUserId = null, { take = MAX_PUBLIC_MATCHES } = {}) {
    const matches = await prisma.match.findMany({
      where: {
        ...upcomingMatchWhere(),
        court: { is: { deletedAt: null, isActive: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take,
      include: PUBLIC_MATCH_INCLUDE,
    });

    return publicCatalogMapper.toPublicMatchList(matches, currentUserId);
  },

  /**
   * Upcoming matches the player is enrolled in (confirmed or waitlisted).
   * Past, completed and canceled matches are intentionally excluded.
   */
  async findMyUpcomingMatches(userId, { take } = {}) {
    if (!userId) return [];

    const matches = await prisma.match.findMany({
      where: {
        ...upcomingMatchWhere(),
        participants: { some: { userId } },
        court: { is: { deletedAt: null } },
      },
      orderBy: { scheduledAt: "asc" },
      ...(take ? { take } : {}),
      include: PUBLIC_MATCH_INCLUDE,
    });

    return publicCatalogMapper.toPublicMatchList(matches, userId);
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

    return publicCatalogMapper.toSubscription(subscription);
  },

  /**
   * Active venues with a lightweight count of their upcoming matches.
   */
  async findPublicCourts() {
    const courts = await prisma.court.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
      include: {
        photos: PHOTO_SELECT,
        matches: {
          where: upcomingMatchWhere(),
          select: { id: true },
        },
      },
    });

    return publicCatalogMapper.toPublicCourtList(courts);
  },

  /**
   * Active venue detail with its upcoming matches.
   */
  async findPublicCourtById(id, currentUserId = null) {
    if (!isUuid(id)) return null;

    const court = await prisma.court.findFirst({
      where: { id, deletedAt: null, isActive: true },
      include: {
        photos: PHOTO_SELECT,
        matches: {
          where: upcomingMatchWhere(),
          orderBy: { scheduledAt: "asc" },
          include: PUBLIC_MATCH_INCLUDE,
        },
      },
    });

    return publicCatalogMapper.toPublicCourtDetail(court, currentUserId);
  },

  async findPublicMatchById(id, currentUserId = null) {
    if (!isUuid(id)) return null;

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

    return publicCatalogMapper.toPublicMatchDetail(match, currentUserId);
  },
};
