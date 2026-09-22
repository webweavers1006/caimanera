import prisma from "@/features/shared/lib/prisma";
import { parishMapper } from "../mappers/parish.mapper";

export const parishReadRepository = {
  async findMany({ page, pageSize, searchTerm, sortKey, sortDirection, municipalityId }) {
    const skip = (page - 1) * pageSize;
    const orderBy = { [parishMapper.toSortKey(sortKey)]: sortDirection || "asc" };

    const where = {
      ...(searchTerm && {
        name: { contains: searchTerm, mode: "insensitive" },
      }),
      ...(municipalityId && { municipalityId: Number(municipalityId) }),
      deletedAt: null,
    };

    const [totalCount, items] = await Promise.all([
      prisma.parish.count({ where }),
      prisma.parish.findMany({ where, skip, take: pageSize, orderBy }),
    ]);

    return {
      items: parishMapper.toDomainList(items),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  },
};
