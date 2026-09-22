import { z } from "zod";
import { AUDIT_LOG_CONFIG } from "../config/audit-log.constants";

/**
 * Zod schema for audit log query parameters.
 * Validates filters passed to the audit log page and API.
 */
export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(
    AUDIT_LOG_CONFIG.PAGINATION.MAX_PAGE_SIZE
  ).default(AUDIT_LOG_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE),
  searchTerm: z.string().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD").optional().or(z.literal("")),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD").optional().or(z.literal("")),
  userId: z.string().uuid().optional().or(z.literal("")),
  sortKey: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});
