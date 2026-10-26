import prisma from "@/features/shared/lib/prisma";
import { playerPaymentMapper } from "../mappers/player-payment.mapper";

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

export const playerPaymentsReadRepository = {
  async findByUser(userId, { take = 50 } = {}) {
    const items = await prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take,
    });

    const matchTitles = await resolveMatchTitles(items);
    return playerPaymentMapper.toDomainList(items, matchTitles);
  },
};
