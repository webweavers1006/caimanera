import prisma from "@/features/shared/lib/prisma";
import { transactionMapper } from "../mappers/transaction.mapper";

async function resolveMatchTitles(items) {
  const matchIds = [
    ...new Set(items.map((item) => item.matchId).filter(Boolean)),
  ];
  if (matchIds.length === 0) return new Map();

  const matches = await prisma.match.findMany({
    where: { id: { in: matchIds } },
    select: { id: true, title: true },
  });

  return new Map(matches.map((match) => [match.id, match.title]));
}

export const transactionReadRepository = {
  async findMany({ page = 1, pageSize = 10, searchTerm, sortKey, sortDirection }) {
    const skip = (page - 1) * pageSize;
    const dbKey = transactionMapper.toSortKey(sortKey);
    const orderBy = { [dbKey]: sortDirection || "desc" };

    const where = searchTerm
      ? {
          OR: [
            { reference: { contains: searchTerm, mode: "insensitive" } },
            { user: { firstName: { contains: searchTerm, mode: "insensitive" } } },
            { user: { lastName: { contains: searchTerm, mode: "insensitive" } } },
            { user: { email: { contains: searchTerm, mode: "insensitive" } } },
          ],
        }
      : {};

    const [totalCount, items] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
    ]);

    const matchTitles = await resolveMatchTitles(items);

    return {
      items: transactionMapper.toDomainList(items, matchTitles),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  },

  async findById(id) {
    const item = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!item) return null;
    const matchTitles = await resolveMatchTitles([item]);
    return transactionMapper.toDomain(item, {
      matchTitle: matchTitles.get(item.matchId) || null,
    });
  },
};
