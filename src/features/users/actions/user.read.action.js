'use server'

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { searchActiveUsersList } from '../services/user.read.service'
import { USER_CONFIG } from "../config/user.constants";

/**
 * Searches users by name, surname or ID card.
 * @param {string} query - Search term.
 * @returns {Promise<Array>} List of users.
 */
export const searchUsersList = createProtectedFunction(USER_CONFIG.PERMISSIONS.READ, async (query, session) => {
  return await searchActiveUsersList(query, session)
});
