import { subscriptionWriteRepository } from "../repositories/subscription.write.repository";
import { validateSubscriptionRules } from "./subscription.validation.service";
import { SUBSCRIPTION_CONFIG } from "../config/subscription.constants";
import { logger } from "@/features/shared";

const { MESSAGES } = SUBSCRIPTION_CONFIG.UI.LABELS;

export async function createSubscription(data) {
  const validation = await validateSubscriptionRules(data);
  if (!validation.success) return validation;

  try {
    const result = await subscriptionWriteRepository.create(data);
    return { success: true, data: result, message: MESSAGES.SUCCESS.CREATE };
  } catch (error) {
    logger.error("Error creating subscription plan", { error: error.message });
    return { success: false, error: MESSAGES.ERROR.CREATE };
  }
}

export async function updateSubscription(id, data) {
  const validation = await validateSubscriptionRules(data, id);
  if (!validation.success) return validation;

  try {
    const result = await subscriptionWriteRepository.update(id, data);
    return { success: true, data: result, message: MESSAGES.SUCCESS.UPDATE };
  } catch (error) {
    logger.error("Error updating subscription plan", { error: error.message, subscriptionId: id });
    return { success: false, error: MESSAGES.ERROR.UPDATE };
  }
}

export async function deleteSubscription(id) {
  try {
    await subscriptionWriteRepository.softDelete(id);
    return { success: true, message: MESSAGES.SUCCESS.DELETE };
  } catch (error) {
    logger.error("Error deleting subscription plan", { error: error.message, subscriptionId: id });
    return { success: false, error: MESSAGES.ERROR.DELETE };
  }
}
