import prisma from "@/features/shared/lib/prisma";
import { courtMapper } from "../mappers/court.mapper";

const COURT_INCLUDE = {
  manager: { select: { id: true, firstName: true, lastName: true } },
  photos: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
};

export const courtReadRepository = {
  async findMany({ page, pageSize, searchTerm, sortKey, sortDirection, isActive }) {
    const skip = (page - 1) * pageSize;
    const dbKey = courtMapper.toSortKey(sortKey);
    const orderBy = { [dbKey]: sortDirection || "asc" };

    const where = {
      ...(searchTerm && {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { sport: { contains: searchTerm, mode: "insensitive" } },
          { address: { contains: searchTerm, mode: "insensitive" } },
        ],
      }),
      ...(typeof isActive === "boolean" && { isActive }),
      deletedAt: null,
    };

    const [totalCount, items] = await Promise.all([
      prisma.court.count({ where }),
      prisma.court.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: COURT_INCLUDE,
      }),
    ]);

    return {
      items: courtMapper.toDomainList(items),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  },

  async findById(id) {
    const item = await prisma.court.findFirst({
      where: { id, deletedAt: null },
      include: COURT_INCLUDE,
    });
    return courtMapper.toDomain(item);
  },

  async findByName(name, excludeId = null) {
    return await prisma.court.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  },
};
