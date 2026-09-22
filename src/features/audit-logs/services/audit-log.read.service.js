import { auditLogReadRepository } from "../repositories/audit-log.read.repository";
import { logger } from "@/features/shared/lib/logger";

export async function fetchAuditLogsList(params) {
  try {
    return await auditLogReadRepository.findMany(params);
  } catch (error) {
    logger.error("Failed to fetch audit logs", { error: error.message });
    throw error;
  }
}
