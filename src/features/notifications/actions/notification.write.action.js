"use server";

import { createProtectedFunction, createProtectedAction } from "@/features/shared/lib/safe-action";
import { NOTIFICATION_CONFIG } from "../config/notification.constants";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification.write.service";
import { markAsReadSchema } from "../schemas/notification.schema";
import { revalidatePath } from "next/cache";

/**
 * Marks a single notification as read.
 * Ownership check: only the recipient can mark it.
 * Validates the notification id via Zod schema.
 */
export const markAsReadAction = createProtectedAction(
  NOTIFICATION_CONFIG.PERMISSIONS.MARK_READ,
  markAsReadSchema,
  async ({ id }, session) => {
    const result = await markNotificationAsRead(id, session.id);
    if (result.success) {
      revalidatePath(NOTIFICATION_CONFIG.PATH);
    }
    return result;
  }
);

/**
 * Marks all notifications as read for the current user.
 * No input data to validate — uses createProtectedFunction (RBAC + CSRF).
 */
export const markAllAsReadAction = createProtectedFunction(
  NOTIFICATION_CONFIG.PERMISSIONS.MARK_ALL_READ,
  async (_data, session) => {
    const result = await markAllNotificationsAsRead(session.id);
    if (result.success) {
      revalidatePath(NOTIFICATION_CONFIG.PATH);
    }
    return result;
  }
);
