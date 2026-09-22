import prisma from "@/features/shared/lib/prisma";
import { matchMapper } from "../mappers/match.mapper";

export const matchReadRepository = {
  async findMany({ page, pageSize, searchTerm, sortKey, sortDirection }) {
    const skip = (page - 1) * pageSize;
    const dbKey = matchMapper.toSortKey(sortKey);
    const orderBy = { [dbKey]: sortDirection || "desc" };

    const where = {
      ...(searchTerm && {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { sport: { contains: searchTerm, mode: "insensitive" } },
        ],
      }),
      deletedAt: null,
    };

    const [totalCount, items] = await Promise.all([
      prisma.match.count({ where }),
      prisma.match.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          host: { select: { id: true, firstName: true, lastName: true } },
          court: {
            select: {
              id: true,
              name: true,
              photos: {
                where: { deletedAt: null },
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      items: matchMapper.toDomainList(items),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  },

  async findById(id) {
    const item = await prisma.match.findUnique({
      where: { id },
      include: {
        host: { select: { id: true, firstName: true, lastName: true } },
        court: { select: { id: true, name: true } },
      },
    });
    return matchMapper.toDomain(item);
  },

  // Detail view — includes court info + participants with user names.
  async findByIdWithParticipants(id) {
    const item = await prisma.match.findUnique({
      where: { id },
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
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });
    return matchMapper.toDetail(item);
  },

  // Used by the validation service to reject two matches starting at the
  // exact same time on the same court.
  async findByCourtAndStart(courtId, scheduledAt, excludeId = null) {
    return await prisma.match.findFirst({
      where: {
        courtId,
        scheduledAt: new Date(scheduledAt),
        deletedAt: null,
        status: { not: "CANCELED" },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  },
};
