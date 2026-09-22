"use server";

import { createAuthenticatedFunction } from "@/features/shared/lib/safe-action";
import { searchActiveUsersList } from "../services/user.read.service";

/**
 * Returns a flat list of Users for use in async select dropdowns.
 * Label format: "Nombre Apellido" with idCard as secondary info.
 * Authenticated — public catalog, no RBAC permission required.
 * @param {Object} options
 * @param {string} [options.searchTerm] - Text search filter
 */
export const getUsersForSelectAction = createAuthenticatedFunction(
  async ({ searchTerm } = {}) => {
    const users = await searchActiveUsersList(searchTerm || "");
    return users.map((user) => ({
      label: `${user.firstName} ${user.lastName || ""}`.trim(),
      value: user.id,
      idCard: user.idCard || null,
    }));
  }
);
