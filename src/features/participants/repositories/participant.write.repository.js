import prisma from "@/features/shared/lib/prisma";
import { participantMapper } from "../mappers/participant.mapper";

async function refreshMatchStatus(matchId) {
  const [match, confirmed] = await Promise.all([
    prisma.match.findUnique({
      where: { id: matchId },
      select: { capacity: true, status: true },
    }),
    prisma.participant.count({ where: { matchId, status: "CONFIRMED" } }),
  ]);

  if (!match || !["OPEN", "FULL"].includes(match.status)) return;

  const nextStatus = confirmed >= match.capacity ? "FULL" : "OPEN";
  if (nextStatus !== match.status) {
    await prisma.match.update({
      where: { id: matchId },
      data: { status: nextStatus },
    });
  }
}

export const participantWriteRepository = {
  async create(data) {
    const persistence = participantMapper.toPersistence(data);
    const item = await prisma.participant.create({
      data: persistence,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        match: { select: { id: true, title: true } },
      },
    });
    await refreshMatchStatus(persistence.matchId);
    return participantMapper.toDomain(item);
  },

  async update(id, data) {
    const persistence = participantMapper.toPersistence(data);
    const item = await prisma.participant.update({
      where: { id },
      data: persistence,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        match: { select: { id: true, title: true } },
      },
    });
    await refreshMatchStatus(persistence.matchId);
    return participantMapper.toDomain(item);
  },

  // Participant is a pivot-like enrollment record: hard delete is used
  // (the @@unique([userId, matchId]) constraint forbids soft-deleting).
  async delete(id) {
    const participant = await prisma.participant.delete({
      where: { id },
    });

    if (participant.status === "CONFIRMED") {
      const next = await prisma.participant.findFirst({
        where: { matchId: participant.matchId, status: "WAITLIST" },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });
      if (next) {
        await prisma.participant.update({
          where: { id: next.id },
          data: { status: "CONFIRMED" },
        });
      }
    }

    await refreshMatchStatus(participant.matchId);
    return participant;
  },
};
