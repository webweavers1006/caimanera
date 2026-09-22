"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { ROLE_CONFIG } from "../config/role.constants";
import { fetchAllRolesList } from "../services/role.read.service";

/**
 * Returns roles for use in async multi-select filters.
 * Protected — requires roles:read.
 */
export const getRolesForSelectAction = createProtectedFunction(
  ROLE_CONFIG.PERMISSIONS.READ,
  async ({ searchTerm } = {}) => {
    const roles = await fetchAllRolesList();
    const term = (searchTerm || "").toLowerCase();
    const filtered = term
      ? roles.filter((r) => r.name?.toLowerCase().includes(term))
      : roles;
    return filtered.map((r) => ({ label: r.name, value: r.id }));
  }
);
