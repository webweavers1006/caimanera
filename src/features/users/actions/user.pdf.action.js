"use server";

/**
 * user.pdf.action.js
 * Protected server action for generating the users PDF report.
 * Validates session + CSRF + users:read permission before generating.
 *
 * Architecture: Action → Service → Repository → Mapper
 */

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { USER_CONFIG } from "../config/user.constants";
import { fetchUsersPdf } from "../services/user.pdf.read.service";

/**
 * Generates a PDF report with the current user list.
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
export const generateUsersPdfAction = createProtectedFunction(
  USER_CONFIG.PERMISSIONS.READ,
  async (filters = {}) => {
    const buffer = await fetchUsersPdf(filters);
    return { success: true, data: buffer };
  }
);
