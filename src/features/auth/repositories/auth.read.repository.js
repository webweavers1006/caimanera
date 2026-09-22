import prisma from "@/features/shared/lib/prisma";
import { authMapper } from "../mappers/auth.mapper";

/**
 * Repository for Authentication Read Operations.
 */
export const authReadRepository = {
  /**
   * Retrieves a user by their Email for authentication purposes.
   * Does NOT return the password hash — use getPasswordHashByEmail() for that.
   * @param {string} email - User's Email
   * @returns {Promise<Object|null>} Domain user object (no password)
   */
  async findByEmail(email) {
    const rawUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        idCard: true,
        deletedAt: true,
        role: { select: { name: true } },
      },
    });
    return authMapper.toDomain(rawUser);
  },

  /**
   * Retrieves only the password hash for a given email.
   * Used exclusively by authenticateUser() for bcrypt comparison.
   * The hash never leaves the service layer.
   * @param {string} email
   * @returns {Promise<{password: string}|null>}
   */
  async getPasswordHashByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      select: { password: true },
    });
  },

  /**
   * Retrieves only the password hash for a given user id.
   * Used exclusively by the self-service password change flow.
   * The hash never leaves the service layer.
   * @param {string} id - User UUID
   * @returns {Promise<{password: string}|null>}
   */
  async getPasswordHashById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });
  },

  async findByIdCard(idCard) {
    const rawUser = await prisma.user.findUnique({
      where: { idCard },
      select: {
        id: true,
        firstName: true,
        idCard: true,
        deletedAt: true,
        role: { select: { name: true } },
      },
    });
    return authMapper.toDomain(rawUser);
  }
};
