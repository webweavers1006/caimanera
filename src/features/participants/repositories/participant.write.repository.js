import prisma from "@/features/shared/lib/prisma";
import { participantMapper } from "../mappers/participant.mapper";

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
    return participantMapper.toDomain(item);
  },

  // Participant is a pivot-like enrollment record: hard delete is used
  // (the @@unique([userId, matchId]) constraint forbids soft-deleting).
  async delete(id) {
    return await prisma.participant.delete({
      where: { id },
    });
  },
};
