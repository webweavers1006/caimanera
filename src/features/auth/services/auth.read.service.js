import { logger } from "@/features/shared";
import { cache } from "react";
import bcrypt from 'bcryptjs';
import { AUTH_CONFIG } from '../config/auth.constants';
import { authReadRepository } from '../repositories/auth.read.repository';

/**
 * Validates a decrypted session against the current database state.
 * Returns null when the user was deleted, disabled or lost their role.
 * Also returns the current role so a role change takes effect immediately
 * even if the JWT still contains the old role name.
 *
 * Cached per request to avoid duplicate lookups across layout/page/action.
 *
 * @param {{id:string, role:string, firstName?:string}|null} session
 * @returns {Promise<{id:string, role:string, firstName:string}|null>}
 */
export const validateSessionUser = cache(async (session) => {
  if (!session?.id) return null;

  try {
    const user = await authReadRepository.findSessionUser(session.id);
    if (!user || user.deletedAt) return null;
    if (!user.role || user.role.deletedAt) return null;

    return {
      id: user.id,
      role: user.role.name,
      firstName: user.firstName || session.firstName || "",
    };
  } catch (error) {
    logger.error("Session validation failed", { error: error.message });
    return null;
  }
});


/**
 * Authenticates a user with their credentials.
 * Read-only operation — verifies email + password against stored hash.
 *
 * @param {string} email - User's email
 * @param {string} password - Raw password
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function authenticateUser(email, password) {
  try {
    // Fetch user (without password) and password hash in parallel
    const [user, hashRecord] = await Promise.all([
      authReadRepository.findByEmail(email),
      authReadRepository.getPasswordHashByEmail(email),
    ]);

    if (!user || !hashRecord?.password || user.deletedAt !== null) {
      return { success: false, error: AUTH_CONFIG.ERRORS.INVALID_CREDENTIALS };
    }

    const isValid = await bcrypt.compare(password, hashRecord.password);

    if (!isValid) {
      return { success: false, error: AUTH_CONFIG.ERRORS.INVALID_CREDENTIALS };
    }

    return { success: true, user };

  } catch (error) {
    logger.error('Authentication error:', error);
    return { success: false, error: AUTH_CONFIG.ERRORS.SERVER_ERROR };
  }
}
