"use server";

import { createAnyPermissionProtectedFunction } from "@/features/shared/lib/safe-action";
import { searchActiveUsersList } from "../services/user.read.service";

/**
 * Returns a flat list of Users for staff-only async selects.
 * Requires at least one management permission; never exposes cédula or email.
 *
 * @param {Object} options
 * @param {string} [options.searchTerm] - Text search filter
 */
export const getUsersForSelectAction = createAnyPermissionProtectedFunction(
  ["users:view", "matches:create", "courts:update", "participants:create"],
  async ({ searchTerm } = {}) => {
    const users = await searchActiveUsersList(searchTerm || "");
    return users.map((user) => ({
      label: `${user.firstName} ${user.lastName || ""}`.trim(),
      value: user.id,
    }));
  }
);
