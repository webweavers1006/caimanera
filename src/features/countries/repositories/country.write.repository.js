import prisma from "@/features/shared/lib/prisma";
import { countryMapper } from "../mappers/country.mapper";

export const countryWriteRepository = {
  async create(data) {
    const persistence = countryMapper.toPersistence(data);
    const item = await prisma.country.create({ data: persistence });
    return countryMapper.toDomain(item);
  },

  async update(id, data) {
    const persistence = countryMapper.toPersistence(data);
    const item = await prisma.country.update({
      where: { id: Number(id) },
      data: persistence,
    });
    return countryMapper.toDomain(item);
  },

  async softDelete(id) {
    return await prisma.country.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });
  },
};
