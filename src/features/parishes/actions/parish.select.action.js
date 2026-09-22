"use server";

import { createAuthenticatedFunction } from "@/features/shared/lib/safe-action";
import { fetchParishesList } from "../services/parish.read.service";

/**
 * Returns a flat list of Parishes for use in async select dropdowns.
 * Authenticated — public catalog, no RBAC permission required.
 * @param {Object} options
 * @param {string} [options.searchTerm] - Text search filter
 * @param {number} [options.municipalityId] - Optional filter by municipality
 */
export const getParishesForSelectAction = createAuthenticatedFunction(
  async ({ searchTerm, municipalityId } = {}) => {
    const result = await fetchParishesList({
      page: 1,
      pageSize: 1200,
      searchTerm: searchTerm || "",
      municipalityId: municipalityId || undefined,
      sortKey: "name",
      sortDirection: "asc",
    });
    return result.items.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }
);
