import prisma from "@/features/shared/lib/prisma";
import { notificationMapper } from "../mappers/notification.mapper";

export const notificationWriteRepository = {
  /**
   * Creates a single notification.
   * @param {Object} data - Domain data (from notificationMapper.toPersistence shape).
   * @returns {Promise<Object>} The created notification record.
   */
  async create(data) {
    const persistence = notificationMapper.toPersistence(data);
    return prisma.notification.create({ data: persistence });
  },

  /**
   * Marks a single notification as read.
   * Only the recipient can mark it.
   * @param {number} id - Notification ID.
   * @param {string} userId - Recipient user UUID (for ownership check).
   * @returns {Promise<Object>} The updated notification.
   */
  async markAsRead(id, userId) {
    return prisma.notification.updateMany({
      where: {
        id,
        recipientUserId: userId,
        isRead: false,
        deletedAt: null,
      },
      data: { isRead: true },
    });
  },

  /**
   * Marks all unread notifications as read for a given user.
   * @param {string} userId - Recipient user UUID.
   * @returns {Promise<Object>} Prisma batch result ({ count }).
   */
  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: {
        recipientUserId: userId,
        isRead: false,
        deletedAt: null,
      },
      data: { isRead: true },
    });
  },
};
