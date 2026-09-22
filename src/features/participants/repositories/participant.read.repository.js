import prisma from "@/features/shared/lib/prisma";
import { participantMapper } from "../mappers/participant.mapper";

export const participantReadRepository = {
  async findMany({ page, pageSize, searchTerm, sortKey, sortDirection }) {
    const skip = (page - 1) * pageSize;
    const dbKey = participantMapper.toSortKey(sortKey);
    const orderBy = { [dbKey]: sortDirection || "desc" };

    const where = searchTerm
      ? {
          OR: [
            { user: { firstName: { contains: searchTerm, mode: "insensitive" } } },
            { user: { lastName: { contains: searchTerm, mode: "insensitive" } } },
            { match: { title: { contains: searchTerm, mode: "insensitive" } } },
          ],
        }
      : {};

    const [totalCount, items] = await Promise.all([
      prisma.participant.count({ where }),
      prisma.participant.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          match: { select: { id: true, title: true } },
        },
      }),
    ]);

    return {
      items: participantMapper.toDomainList(items),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  },

  async findById(id) {
    const item = await prisma.participant.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        match: { select: { id: true, title: true } },
      },
    });
    return participantMapper.toDomain(item);
  },

  // Used by the validation service to reject duplicate enrollments.
  async findByUserAndMatch(userId, matchId, excludeId = null) {
    return await prisma.participant.findFirst({
      where: {
        userId,
        matchId,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  },
};
