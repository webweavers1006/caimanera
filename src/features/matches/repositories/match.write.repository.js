import prisma from "@/features/shared/lib/prisma";
import { matchMapper } from "../mappers/match.mapper";

export const matchWriteRepository = {
  async create(data) {
    const persistence = matchMapper.toPersistence(data);
    const item = await prisma.match.create({
      data: persistence,
      include: {
        host: { select: { id: true, firstName: true, lastName: true } },
        court: { select: { id: true, name: true } },
      },
    });
    return matchMapper.toDomain(item);
  },

  async update(id, data) {
    const persistence = matchMapper.toPersistence(data);
    const item = await prisma.match.update({
      where: { id },
      data: persistence,
      include: {
        host: { select: { id: true, firstName: true, lastName: true } },
        court: { select: { id: true, name: true } },
      },
    });
    return matchMapper.toDomain(item);
  },

  async softDelete(id) {
    return await prisma.match.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
