import { nowVE, nowTimeVE } from "@/features/shared/lib/date-utils";
import { auditLogWriteRepository } from "../repositories/audit-log.write.repository";
import { auditLogReadRepository } from "../repositories/audit-log.read.repository";
import { logger } from "@/features/shared/lib/logger";

/**
 * Registers an audit entry. Designed to be called from other modules'
 * actions/services to log system events.
 *
 * @param {Object} params
 * @param {string} params.userId - UUID of the user who performed the action.
 * @param {string} params.action - Description of the action (e.g., "Login exitoso", "Caso SOL-2026-0042 creado").
 * @returns {Promise<void>} Fire-and-forget — never throws.
 */
export async function createAuditEntry({ userId, action }) {
  try {
    const now = nowVE();
    await auditLogWriteRepository.create({
      userId,
      action,
      date: now,
      time: nowTimeVE(),
    });
  } catch (error) {
    logger.error("Failed to create audit entry", { error: error.message, userId, action });
    // Fire-and-forget: never throw to the caller
  }
}

/**
 * Registers a "first view" audit entry when a user opens a case detail.
 * Only creates the entry if the user hasn't viewed this case before.
 *
 * @param {Object} params
 * @param {string} params.userId - UUID of the user viewing the case.
 * @param {number} params.caseId - ID of the case being viewed.
 * @param {string} params.requestNumber - Request number for display (e.g., "SOL-2026-0042").
 * @returns {Promise<void>} Fire-and-forget.
 */
export async function registerCaseView({ userId, caseId, requestNumber }) {
  if (!userId || !caseId) return;

  try {
    const alreadyViewed = await auditLogReadRepository.hasUserViewedCase(userId, caseId);
    if (alreadyViewed) return;

    await createAuditEntry({
      userId,
      action: `Visto caso #${caseId} ${requestNumber || ""}`.trim(),
    });
  } catch (error) {
    logger.error("Failed to register case view", { error: error.message, userId, caseId });
  }
}
