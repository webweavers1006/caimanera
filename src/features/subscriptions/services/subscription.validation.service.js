import { subscriptionReadRepository } from "../repositories/subscription.read.repository";

export async function validateSubscriptionRules(data, excludeId = null) {
  const existing = await subscriptionReadRepository.findByName(data.name, excludeId);

  if (existing) {
    return {
      success: false,
      error: "Ya existe un plan con este nombre.",
      details: { name: ["Este nombre ya está en uso."] }
    };
  }

  return { success: true };
}
