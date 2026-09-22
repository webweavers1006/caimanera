import prisma from "@/features/shared/lib/prisma";
import { userMapper } from "../mappers/user.mapper";

/**
 * Crea un nuevo usuario en la base de datos.
 */
export async function createUser(userDomainDto) {
  const data = userMapper.toPersistence(userDomainDto);
  // Strip disconnect-only relations — Prisma rejects `disconnect` on create
  for (const key of Object.keys(data)) {
    if (data[key] && typeof data[key] === "object" && "disconnect" in data[key] && Object.keys(data[key]).length === 1) {
      delete data[key];
    }
  }
  const rawUser = await prisma.user.create({ data });
  return userMapper.toDomain(rawUser);
}

/**
 * Actualiza un usuario existente.
 */
export async function updateUser(id, userDomainDto) {
  const data = userMapper.toPersistence(userDomainDto);
  const rawUser = await prisma.user.update({ 
    where: { id }, 
    data 
  });
  return userMapper.toDomain(rawUser);
}

/**
 * Realiza un borrado lógico (soft delete) de un usuario.
 */
export async function deleteUser(id) {
  // Clear leader references before soft-delete (anti-orphan guard)
  await prisma.administrativeDirection.updateMany({
    where: { leaderId: id },
    data: { leaderId: null },
  });
  await prisma.organizationalUnit.updateMany({
    where: { leaderId: id },
    data: { leaderId: null },
  });

  const rawUser = await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return userMapper.toDomain(rawUser);
}

/**
 * Updates only the password hash for a given user.
 * Used by the send-credentials workflow after generating a new random password.
 *
 * @param {string} userId - User UUID.
 * @param {string} passwordHash - bcrypt hash of the new password.
 * @returns {Promise<Object>}
 */
export async function updateUserPassword(userId, passwordHash) {
  return await prisma.user.update({
    where: { id: userId },
    data: { password: passwordHash },
  });
}
