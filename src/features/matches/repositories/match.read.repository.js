import prisma from "@/features/shared/lib/prisma";
import { matchMapper } from "../mappers/match.mapper";

const UPCOMING_STATUSES = ["OPEN", "FULL", "IN_PROGRESS"];

function buildWhere({ searchTerm, statusFilter = "upcoming", courtId } = {}) {
  const now = new Date();
  const filters = [];

  if (searchTerm) {
    filters.push({
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { sport: { contains: searchTerm, mode: "insensitive" } },
        { court: { is: { name: { contains: searchTerm, mode: "insensitive" } } } },
        { court: { is: { address: { contains: searchTerm, mode: "insensitive" } } } },
      ],
    });
  }

  if (courtId) filters.push({ courtId });

  if (statusFilter === "upcoming") {
    filters.push(
      { scheduledAt: { gte: now } },
      { status: { in: UPCOMING_STATUSES } }
    );
  } else if (statusFilter === "open") {
    filters.push({ status: "OPEN" }, { scheduledAt: { gte: now } });
  } else if (statusFilter === "full") {
    filters.push({ status: "FULL" }, { scheduledAt: { gte: now } });
  } else if (statusFilter === "past") {
    filters.push({
      OR: [{ scheduledAt: { lt: now } }, { status: "COMPLETED" }],
    });
  } else if (statusFilter === "canceled") {
    filters.push({ status: "CANCELED" });
  }

  return {
    deletedAt: null,
    ...(filters.length > 0 ? { AND: filters } : {}),
  };
}

const LIST_INCLUDE = {
  host: { select: { id: true, firstName: true, lastName: true } },
  participants: { select: { userId: true, status: true } },
  court: {
    select: {
      id: true,
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      photos: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  },
};

export const matchReadRepository = {
  async findMany({
    page,
    pageSize,
    searchTerm,
    sortKey,
    sortDirection,
    statusFilter = "upcoming",
    currentUserId = null,
  }) {
    const skip = (page - 1) * pageSize;
    const dbKey = matchMapper.toSortKey(sortKey);
    const orderBy = { [dbKey]: sortDirection || "asc" };
    const where = buildWhere({ searchTerm, statusFilter });

    const [totalCount, items] = await Promise.all([
      prisma.match.count({ where }),
      prisma.match.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: LIST_INCLUDE,
      }),
    ]);

    return {
      items: matchMapper.toDomainList(items, currentUserId),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  },

  async findById(id, currentUserId = null) {
    const item = await prisma.match.findFirst({
      where: { id, deletedAt: null },
      include: {
        host: { select: { id: true, firstName: true, lastName: true } },
        court: { select: { id: true, name: true } },
        participants: { select: { userId: true, status: true } },
      },
    });
    return matchMapper.toDomain(item, currentUserId);
  },

  // Detail view — includes court info + participants with user names.
  async findByIdWithParticipants(id, currentUserId = null, includeParticipantNames = true) {
    const item = await prisma.match.findFirst({
      where: { id, deletedAt: null },
      include: {
        host: { select: { id: true, firstName: true, lastName: true, email: true } },
        court: {
          select: {
            id: true,
            name: true,
            description: true,
            sport: true,
            address: true,
            latitude: true,
            longitude: true,
            hourlyRate: true,
            isActive: true,
            manager: { select: { id: true, firstName: true, lastName: true } },
            photos: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { id: true, url: true } },
          },
        },
        participants: {
          orderBy: [{ status: "asc" }, { createdAt: "asc" }],
          ...(includeParticipantNames
            ? { include: { user: { select: { id: true, firstName: true, lastName: true } } } }
            : { select: { id: true, userId: true, status: true, position: true, paymentType: true } }),
        },
      },
    });
    return matchMapper.toDetail(item, currentUserId);
  },

  /**
   * Returns matches on the same court around the target time so the
   * validation service can detect overlapping ranges (not just equal starts).
   */
  async findForCourtAround(courtId, scheduledAt, excludeId = null) {
    const start = new Date(scheduledAt);
    if (Number.isNaN(start.getTime())) return [];

    const windowStart = new Date(start.getTime() - 12 * 60 * 60 * 1000);
    const windowEnd = new Date(start.getTime() + 12 * 60 * 60 * 1000);

    return await prisma.match.findMany({
      where: {
        courtId,
        deletedAt: null,
        status: { not: "CANCELED" },
        scheduledAt: { gte: windowStart, lte: windowEnd },
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true, title: true, scheduledAt: true, durationMins: true },
    });
  },
};
