import prisma from "@/features/shared/lib/prisma";
import { courtMapper } from "../mappers/court.mapper";

const PHOTO_INCLUDE = {
  manager: { select: { id: true, firstName: true, lastName: true } },
  photos: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
};

export const courtWriteRepository = {
  async create(data) {
    const persistence = courtMapper.toPersistence(data);
    const photos = data.photos || [];
    const item = await prisma.court.create({
      data: {
        ...persistence,
        photos: photos.length > 0
          ? { create: photos.map((url, index) => ({ url, sortOrder: index })) }
          : undefined,
      },
      include: PHOTO_INCLUDE,
    });
    return courtMapper.toDomain(item);
  },

  async update(id, data) {
    const persistence = courtMapper.toPersistence(data);
    const photos = data.photos || [];

    // Media rows are replaced on save (delete + recreate) — court photos are
    // assets, not business entities referenced elsewhere.
    await prisma.courtPhoto.deleteMany({ where: { courtId: id } });

    const item = await prisma.court.update({
      where: { id },
      data: {
        ...persistence,
        photos: photos.length > 0
          ? { create: photos.map((url, index) => ({ url, sortOrder: index })) }
          : undefined,
      },
      include: PHOTO_INCLUDE,
    });
    return courtMapper.toDomain(item);
  },

  async softDelete(id) {
    return await prisma.court.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
