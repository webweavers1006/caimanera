"use server";

import { SHARED_CONFIG } from "@/features/shared";
import { createProtectedAction, createProtectedFunction } from "@/features/shared/lib/safe-action";
import {
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "../services/subscription.write.service";
import { SUBSCRIPTION_CONFIG } from "../config/subscription.constants";
import { subscriptionSchema } from "../schemas/subscription.schema";
import { logger } from "@/features/shared/lib/logger";
import { revalidatePath } from "next/cache";

export const saveSubscriptionAction = createProtectedAction(
  (data) => data.id ? SUBSCRIPTION_CONFIG.PERMISSIONS.UPDATE : SUBSCRIPTION_CONFIG.PERMISSIONS.WRITE,
  subscriptionSchema,
  async (data) => {
    try {
      const { id, ...rest } = data;

      let result;
      if (id) {
        result = await updateSubscription(id, rest);
      } else {
        result = await createSubscription(rest);
      }

      if (result.success) {
        revalidatePath(SUBSCRIPTION_CONFIG.PATH);
      }
      return result;
    } catch (error) {
      logger.error("Failed to save subscription plan", { error: error.message });
      return { success: false, error: SHARED_CONFIG.UI.LABELS.MESSAGES.UNEXPECTED_SERVER_ERROR };
    }
  }
);

export const deleteSubscriptionAction = createProtectedFunction(
  SUBSCRIPTION_CONFIG.PERMISSIONS.DELETE,
  async (id) => {
    try {
      const result = await deleteSubscription(id);
      if (result.success) {
        revalidatePath(SUBSCRIPTION_CONFIG.PATH);
      }
      return result;
    } catch (error) {
      logger.error("Failed to delete subscription plan", { error: error.message, subscriptionId: id });
      return { success: false, error: SHARED_CONFIG.UI.LABELS.MESSAGES.UNEXPECTED_DELETE_ERROR };
    }
  }
);
