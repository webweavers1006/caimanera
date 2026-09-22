"use server";

import { createAuthenticatedFunction } from "@/features/shared/lib/safe-action";
import { fetchMunicipalitiesList } from "../services/municipality.read.service";

/**
 * Returns a flat list of Municipalities for use in async select dropdowns.
 * Authenticated — public catalog, no RBAC permission required.
 * @param {Object} options
 * @param {string} [options.searchTerm] - Text search filter
 * @param {number} [options.stateId] - Optional filter by state
 */
export const getMunicipalitiesForSelectAction = createAuthenticatedFunction(
  async ({ searchTerm, stateId } = {}) => {
    const result = await fetchMunicipalitiesList({
      page: 1,
      pageSize: 400,
      searchTerm: searchTerm || "",
      stateId: stateId || undefined,
      sortKey: "name",
      sortDirection: "asc",
    });
    return result.items.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }
);
