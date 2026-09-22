"use server";

import { createAuthenticatedFunction } from "@/features/shared/lib/safe-action";
import { courtReadRepository } from "../repositories/court.read.repository";

/**
 * Returns a flat list of Courts for use in async select dropdowns.
 * Authenticated — public catalog, no RBAC permission required.
 * @param {Object} options
 * @param {string} [options.searchTerm] - Text search filter
 */
export const getCourtsForSelectAction = createAuthenticatedFunction(
  async ({ searchTerm } = {}) => {
    const result = await courtReadRepository.findMany({
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
