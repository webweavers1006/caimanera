"use server";

import { createAuthenticatedFunction } from "@/features/shared/lib/safe-action";
import { matchReadRepository } from "../repositories/match.read.repository";

/**
 * Returns a flat list of Matches for use in async select dropdowns.
 * Authenticated — public catalog, no RBAC permission required.
 * @param {Object} options
 * @param {string} [options.searchTerm] - Text search filter
 */
export const getMatchesForSelectAction = createAuthenticatedFunction(
  async ({ searchTerm } = {}) => {
    const result = await matchReadRepository.findMany({
      page: 1,
      pageSize: 300,
      searchTerm: searchTerm || "",
      sortKey: "scheduledAt",
      sortDirection: "desc",
    });
    return result.items.map((item) => ({
      label: item.title,
      value: item.id,
    }));
  }
);
