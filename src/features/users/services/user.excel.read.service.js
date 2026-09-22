/**
 * user.excel.read.service.js
 * Read service for Excel export — orchestrates the repository call.
 * Reuses the same repository as PDF export.
 *
 * Architecture: Action → Service → Repository → Mapper
 */

import { findAllUsersForPdfExport } from "../repositories/user.pdf.repository";
import { generateUsersExcel } from "./user.excel.service";
import { logger } from "@/features/shared";

/**
 * Fetches users matching the given filters and generates an Excel buffer.
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
 * @returns {Promise<Buffer>} Excel buffer
 */
export async function fetchUsersExcel(filters = {}) {
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

  logger.info("Users Excel generated", { count: users.length });

  return generateUsersExcel({ users });
}
