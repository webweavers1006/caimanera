import bcrypt from "bcryptjs";
import { logger } from "@/features/shared";
import { AUTH_CONFIG } from "../config/auth.constants";
import { authReadRepository } from "../repositories/auth.read.repository";
import { updateUserPasswordHash } from "@/features/users/services/user.integration.service";

const SALT_ROUNDS = 12;

/**
 * Changes a user's own password after verifying the current one.
 * Domain logic — the hash never leaves this service layer.
 *
 * @param {Object} params
 * @param {string} params.userId - Session user UUID.
 * @param {string} params.currentPassword - Raw current password.
 * @param {string} params.newPassword - Raw new password.
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function changeUserPassword({ userId, currentPassword, newPassword }) {
  try {
    const hashRecord = await authReadRepository.getPasswordHashById(userId);

    if (!hashRecord?.password) {
      return { success: false, error: AUTH_CONFIG.PASSWORD_CHANGE.ERRORS.GENERIC };
    }

    const isValid = await bcrypt.compare(currentPassword, hashRecord.password);
    if (!isValid) {
      return { success: false, error: AUTH_CONFIG.PASSWORD_CHANGE.ERRORS.CURRENT_INCORRECT };
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await updateUserPasswordHash(userId, newHash);

    return { success: true, message: AUTH_CONFIG.PASSWORD_CHANGE.MESSAGES.SUCCESS };
  } catch (error) {
    logger.error("Error changing password", { error: error.message, userId });
    return { success: false, error: AUTH_CONFIG.PASSWORD_CHANGE.ERRORS.GENERIC };
  }
}
