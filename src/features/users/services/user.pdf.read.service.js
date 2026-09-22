/**
 * user.pdf.read.service.js
 * Read service for PDF export — orchestrates the repository call.
 *
 * Architecture: Action → Service → Repository → Mapper
 */

import { findAllUsersForPdfExport } from "../repositories/user.pdf.repository";
import { generateUsersPdf } from "./user.pdf.service";
import { logger } from "@/features/shared";

/**
 * Fetches users matching the given filters and generates a PDF buffer.
 *
 * @param {object} filters
 * @param {string} [filters.searchTerm]
 * @param {string} [filters.status]
 * @param {string} [filters.roleId]
 * @param {string} [filters.officeId]
 * @param {string} [filters.directionId]
 * @param {string} [filters.dateFrom]
 * @param {string} [filters.dateTo]
 * @param {string[]} [filters.userIds] - Specific user UUIDs (selection mode)
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function fetchUsersPdf(filters = {}) {
  const users = await findAllUsersForPdfExport({
    searchTerm: filters.searchTerm || undefined,
    status: filters.status || undefined,
    roleId: filters.roleId || undefined,
    officeId: filters.officeId || undefined,
    directionId: filters.directionId || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    userIds: filters.userIds || undefined,
  });

  logger.info("Users PDF generated", { count: users.length });

  return generateUsersPdf({ users });
}
