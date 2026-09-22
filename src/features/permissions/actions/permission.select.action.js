"use server";

import { createAuthenticatedFunction } from "@/features/shared/lib/safe-action";
import { permissionReadRepository } from "../repositories/permission.read.repository";

/**
 * Public Server Action — returns all permissions for dropdowns/selectors.
 * No RBAC permission required (authenticated users only).
 * Used by role forms and other modules that need to list available permissions.
 *
 * @param {Object} [options]
 * @param {string} [options.searchTerm] — Optional search filter.
 * @returns {Promise<Array<{label: string, value: number}>>}
 */
export const getPermissionsForSelectAction = createAuthenticatedFunction(
  async ({ searchTerm } = {}) => {
    const result = await permissionReadRepository.findAll();

    let items = result;
    if (searchTerm?.trim()) {
      const term = searchTerm.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.slug.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
      );
    }

    return items.map((item) => ({
      label: item.slug,
      value: item.id,
      description: item.description,
    }));
  }
);
