import { createSession } from '@/features/auth/lib/auth';
import { AUTH_CONFIG } from '../config/auth.constants';

/**
 * Creates a session for an authenticated user.
 * Write operation — sets HTTP-only JWT cookie.
 *
 * @param {Object} user - Domain user object
 * @param {string} user.id - User UUID
 * @param {string} user.role - Role name
 * @param {string} user.firstName - User's first name
 */
export async function loginUserSession(user) {
  await createSession({
    id: user.id,
    role: user.roleName || AUTH_CONFIG.ROLES.USER,
    firstName: user.firstName,
  });
}
