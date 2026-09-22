"use server";

import { createAuthenticatedFunction } from "@/features/shared/lib/safe-action";
import { fetchStatesList } from "../services/state.read.service";

/**
 * Returns a flat list of States for use in async select dropdowns.
 * Authenticated — public catalog, no RBAC permission required.
 * @param {Object} options
 * @param {string} [options.searchTerm] - Text search filter
 * @param {number} [options.countryId] - Optional filter by country
 */
export const getStatesForSelectAction = createAuthenticatedFunction(
  async ({ searchTerm, countryId } = {}) => {
    const result = await fetchStatesList({
      page: 1,
      pageSize: 30,
      searchTerm: searchTerm || "",
      countryId: countryId || undefined,
      sortKey: "name",
      sortDirection: "asc",
    });
    return result.items.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }
);
