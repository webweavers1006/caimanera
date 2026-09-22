import { notificationReadRepository } from "../repositories/notification.read.repository";
import { logger } from "@/features/shared/lib/logger";

/**
 * Fetches the unread notification count for a user.
 * Lightweight — designed for polling.
 * @param {string} userId
 * @returns {Promise<number>}
 */
export async function fetchUnreadCount(userId) {
  try {
    return await notificationReadRepository.countUnread(userId);
  } catch (error) {
    logger.error("Failed to fetch unread count", { error: error.message, userId });
    return 0; // Fail gracefully — don't break the UI
  }
}

/**
 * Fetches paginated notifications for a user.
 * @param {Object} params — see notificationReadRepository.findByUser
 * @returns {Promise<Object>} { items, totalCount, totalPages, page, pageSize }
 */
export async function fetchNotifications(params) {
  try {
    return await notificationReadRepository.findByUser(params);
  } catch (error) {
    logger.error("Failed to fetch notifications", { error: error.message });
    throw error;
  }
}
