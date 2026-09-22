"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { NOTIFICATION_CONFIG } from "../config/notification.constants";
import { fetchNotifications, fetchUnreadCount } from "../services/notification.read.service";
import { getSession } from "@/features/auth/lib/auth";

/**
 * Retrieves the notification list for the current user (paginated, with filters).
 * Server Action — protected by permission check.
 */
export const getMyNotificationsAction = createProtectedFunction(
  NOTIFICATION_CONFIG.PERMISSIONS.READ,
  async (params) => {
    const session = await getSession();
    if (!session?.id) {
      return { success: false, error: "Sesión inválida." };
    }

    const result = await fetchNotifications({
      ...params,
      userId: session.id,
    });

    return { success: true, data: result };
  }
);

/**
 * Retrieves the unread notification count for the current user.
 * Lightweight — designed for polling from the bell icon.
 * This is a server action alternative to the API route (both work).
 */
export const getUnreadCountAction = createProtectedFunction(
  NOTIFICATION_CONFIG.PERMISSIONS.READ,
  async () => {
    const session = await getSession();
    if (!session?.id) {
      return { count: 0 };
    }
    const count = await fetchUnreadCount(session.id);
    return { count };
  }
);
