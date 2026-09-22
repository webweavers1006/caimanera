import prisma from "@/features/shared/lib/prisma";
import { stateMapper } from "../mappers/state.mapper";

export const stateReadRepository = {
  async findMany({ page, pageSize, searchTerm, sortKey, sortDirection, countryId }) {
    const skip = (page - 1) * pageSize;
    const orderBy = { [stateMapper.toSortKey(sortKey)]: sortDirection || "asc" };

    const where = {
      ...(searchTerm && {
        name: { contains: searchTerm, mode: "insensitive" },
      }),
      ...(countryId && { countryId: Number(countryId) }),
      deletedAt: null,
    };

    const [totalCount, items] = await Promise.all([
      prisma.state.count({ where }),
      prisma.state.findMany({ where, skip, take: pageSize, orderBy }),
    ]);

    return {
      items: stateMapper.toDomainList(items),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  },
};
