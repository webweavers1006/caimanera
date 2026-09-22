import prisma from "@/features/shared/lib/prisma";
import { municipalityMapper } from "../mappers/municipality.mapper";

export const municipalityReadRepository = {
  async findMany({ page, pageSize, searchTerm, sortKey, sortDirection, stateId }) {
    const skip = (page - 1) * pageSize;
    const orderBy = { [municipalityMapper.toSortKey(sortKey)]: sortDirection || "asc" };

    const where = {
      ...(searchTerm && {
        name: { contains: searchTerm, mode: "insensitive" },
      }),
      ...(stateId && { stateId: Number(stateId) }),
      deletedAt: null,
    };

    const [totalCount, items] = await Promise.all([
      prisma.municipality.count({ where }),
      prisma.municipality.findMany({ where, skip, take: pageSize, orderBy }),
    ]);

    return {
      items: municipalityMapper.toDomainList(items),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  },
};
