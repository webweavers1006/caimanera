import { logger } from "@/features/shared";
import bcrypt from 'bcryptjs';
import { AUTH_CONFIG } from '../config/auth.constants';
import { authReadRepository } from '../repositories/auth.read.repository';

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
