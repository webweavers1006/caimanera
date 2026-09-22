/**
 * User Integration Service — Cross-feature boundary for user data access.
 *
 * Other features MUST import from here instead of reaching into
 * users/repositories/ directly. Keeps the A-S-R-M contract clean.
 */

import { cache } from "react";
import { findUserById, findUserRoleId, findUserOfficeById } from "../repositories/user.read.repository";
import { updateUserPassword } from "../repositories/user.write.repository";

/**
 * Retrieves a user by ID with their relations (role, direction, channel, area).
 * Used by cases, follow-ups, and other features that need operator context.
 * Cached per request via React.cache() — repeated calls within the same
 * render (layout + page + services) hit the DB only once.
 *
 * @param {number} userId
 * @returns {Promise<Object|null>} User domain object or null
 */
export const getUserById = cache(async (userId) => {
  return findUserById(userId);
});

/**
 * Retrieves only the roleId for a user (ultra-lightweight).
 * Used by fire-and-forget operations that need the actor's role.
 *
 * @param {string} userId - User UUID.
 * @returns {Promise<number|null>} Role ID or null
 */
export async function getUserRoleId(userId) {
  const result = await findUserRoleId(userId);
  return result?.roleId ?? null;
}

/**
 * Retrieves only the officeId for a user (ultra-lightweight).
 * Used to preselect the operator's assigned office in forms.
 *
 * @param {string} userId - User UUID.
 * @returns {Promise<number|null>} Office ID or null
 */
export async function getUserOfficeId(userId) {
  const result = await findUserOfficeById(userId);
  return result?.officeId ?? null;
}

/**
 * Updates a user's password hash (cross-feature boundary for auth/self-service).
 * Used by the self-service password change flow in the auth feature.
 *
 * @param {string} userId - User UUID.
 * @param {string} passwordHash - bcrypt hash of the new password.
 * @returns {Promise<Object>}
 */
export async function updateUserPasswordHash(userId, passwordHash) {
  return updateUserPassword(userId, passwordHash);
}
