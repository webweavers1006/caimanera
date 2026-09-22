"use server";

import { createAuthenticatedFunction } from "@/features/shared/lib/safe-action";
import { subscriptionReadRepository } from "../repositories/subscription.read.repository";

/**
 * Returns a flat list of active SubscriptionPlans for use in async select
 * dropdowns. Authenticated — public catalog, no RBAC permission required.
 * "Active" means soft-delete not applied (deletedAt = null).
 * @param {Object} options
 * @param {string} [options.searchTerm] - Text search filter
 */
export const getSubscriptionPlansForSelectAction = createAuthenticatedFunction(
  async ({ searchTerm } = {}) => {
    const result = await subscriptionReadRepository.findMany({
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
