"use server";

/**
 * user.excel.action.js
 * Protected server action for generating the users Excel report.
 * Validates session + CSRF + users:read permission before generating.
 *
 * Architecture: Action → Service → Repository → Mapper
 */

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { USER_CONFIG } from "../config/user.constants";
import { fetchUsersExcel } from "../services/user.excel.read.service";

/**
 * Generates an Excel report with the current user list.
 * Accepts the same filter params as the users table page.
 *
 * @param {object} filters
 * @param {string} [filters.searchTerm]
 * @param {string} [filters.status]
 * @param {string} [filters.roleId]
 * @param {string} [filters.officeId]
 * @param {string} [filters.directionId]
 * @param {string} [filters.dateFrom]
 * @param {string} [filters.dateTo]
 * @param {string[]} [filters.userIds] - Specific user UUIDs (selection mode, bypasses other filters)
 * @returns {Promise<{success: boolean, data?: Buffer, error?: string}>}
 */
export const generateUsersExcelAction = createProtectedFunction(
  USER_CONFIG.PERMISSIONS.READ,
  async (filters = {}) => {
    const buffer = await fetchUsersExcel(filters);
    return { success: true, data: buffer };
  }
);
