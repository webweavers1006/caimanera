"use server";

import { createAuthenticatedFunction } from "@/features/shared/lib/safe-action";
import { countryReadRepository } from "../repositories/country.read.repository";

/**
 * Returns a flat list of Countries for use in async select dropdowns.
 * Authenticated — public catalog, no RBAC permission required.
 */
export const getCountriesForSelectAction = createAuthenticatedFunction(
  async ({ searchTerm } = {}) => {
    const result = await countryReadRepository.findMany({
      page: 1,
      pageSize: 300,
      searchTerm: searchTerm || "",
      sortKey: "name",
      sortDirection: "asc",
    });
    return result.items.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }
);
