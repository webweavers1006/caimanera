import { dashboardReadRepository } from "../repositories/dashboard.read.repository";
import { logger } from "@/features/shared";

export async function fetchDashboardStats() {
  try {
    return await dashboardReadRepository.getStats();
  } catch (error) {
    logger.error("Failed to fetch dashboard stats", { error: error.message });
    throw new Error("No se pudieron cargar los datos.");
  }
}
