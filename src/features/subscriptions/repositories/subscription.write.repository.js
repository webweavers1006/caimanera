import prisma from "@/features/shared/lib/prisma";
import { subscriptionMapper } from "../mappers/subscription.mapper";

export const subscriptionWriteRepository = {
  async create(data) {
    const persistence = subscriptionMapper.toPersistence(data);
    const item = await prisma.subscriptionPlan.create({ data: persistence });
    return subscriptionMapper.toDomain(item);
  },

  async update(id, data) {
    const persistence = subscriptionMapper.toPersistence(data);
    const item = await prisma.subscriptionPlan.update({
      where: { id },
      data: persistence,
    });
    return subscriptionMapper.toDomain(item);
  },

  async softDelete(id) {
    return await prisma.subscriptionPlan.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
