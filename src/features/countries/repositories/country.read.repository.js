import prisma from "@/features/shared/lib/prisma";
import { countryMapper } from "../mappers/country.mapper";

export const countryReadRepository = {
  async findMany({ page, pageSize, searchTerm, sortKey, sortDirection }) {
    const skip = (page - 1) * pageSize;
    const dbKey = countryMapper.toSortKey(sortKey);
    const orderBy = { [dbKey]: sortDirection || "asc" };

    const where = {
      ...(searchTerm && {
        name: { contains: searchTerm, mode: "insensitive" },
      }),
      deletedAt: null,
    };

    const [totalCount, items] = await Promise.all([
      prisma.country.count({ where }),
      prisma.country.findMany({ where, skip, take: pageSize, orderBy }),
    ]);

    return {
      items: countryMapper.toDomainList(items),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  },

  async findById(id) {
    const item = await prisma.country.findUnique({
      where: { id: Number(id) },
    });
    return countryMapper.toDomain(item);
  },

  async findByName(name, excludeId = null) {
    return await prisma.country.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        deletedAt: null,
        ...(excludeId && { id: { not: Number(excludeId) } }),
      },
    });
  },
};
