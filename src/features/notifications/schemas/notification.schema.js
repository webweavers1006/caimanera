import { z } from "zod";
import { NOTIFICATION_CONFIG } from "../config/notification.constants";

const TYPES = Object.values(NOTIFICATION_CONFIG.TYPES);

/**
 * Schema for creating a notification (internal use by services).
 */
export const createNotificationSchema = z.object({
  caseId: z.number().int().positive().optional(),
  type: z.enum(TYPES),
  message: z.string().min(1).max(1000),
  recipientUserId: z.string().uuid(),
  actionUserId: z.string().uuid().optional(),
  actionRoleId: z.number().int().positive().optional(),
  caseAuthorUserId: z.string().uuid().optional(),
  originDirectionId: z.number().int().positive().optional(),
});

/**
 * Schema for marking a single notification as read.
 */
export const markAsReadSchema = z.object({
  id: z.number().int().positive(),
});

/**
 * Schema for notifications list query params (used in actions and service).
 */
export const notificationListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(
    NOTIFICATION_CONFIG.PAGINATION.MAX_PAGE_SIZE
  ).default(NOTIFICATION_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE),
  onlyUnread: z.boolean().optional(),
  searchTerm: z.string().optional(),
  sortKey: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});
