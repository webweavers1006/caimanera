import prisma from "@/features/shared/lib/prisma";
import { subscriptionMapper } from "../mappers/subscription.mapper";

export const subscriptionReadRepository = {
  async findMany({ page, pageSize, searchTerm, sortKey, sortDirection }) {
    const skip = (page - 1) * pageSize;
    const dbKey = subscriptionMapper.toSortKey(sortKey);
    const orderBy = { [dbKey]: sortDirection || "asc" };

    const where = {
      ...(searchTerm && {
        name: { contains: searchTerm, mode: "insensitive" },
      }),
      deletedAt: null,
    };

    const [totalCount, items] = await Promise.all([
      prisma.subscriptionPlan.count({ where }),
      prisma.subscriptionPlan.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
      }),
    ]);

    return {
      items: subscriptionMapper.toDomainList(items),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  },

  async findById(id) {
    const item = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });
    return subscriptionMapper.toDomain(item);
  },

  async findByName(name, excludeId = null) {
    return await prisma.subscriptionPlan.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  },
};
