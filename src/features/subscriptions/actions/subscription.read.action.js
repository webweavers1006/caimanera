"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { SUBSCRIPTION_CONFIG } from "../config/subscription.constants";
import { fetchSubscriptionsList } from "../services/subscription.read.service";

export const getSubscriptionsListAction = createProtectedFunction(
  SUBSCRIPTION_CONFIG.PERMISSIONS.READ,
  async (params) => {
    return fetchSubscriptionsList(params);
  }
);
