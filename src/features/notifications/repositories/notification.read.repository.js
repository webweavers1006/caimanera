import prisma from "@/features/shared/lib/prisma";
import { notificationMapper } from "../mappers/notification.mapper";

/**
 * Include clause for notification queries.
 * Brings related data needed for display.
 */
const NOTIFICATION_INCLUDE = {
  case: {
    select: { requestNumber: true },
  },
  actionUser: {
    select: { id: true, firstName: true, lastName: true },
  },
  actionRole: {
    select: { name: true },
  },
  originDirection: {
    select: { name: true },
  },
};

export const notificationReadRepository = {
  /**
   * Counts unread notifications for a given user.
   * Used by the polling endpoint (lightweight — no includes).
   * @param {string} userId - User UUID.
   * @returns {Promise<number>}
   */
  async countUnread(userId) {
    return prisma.notification.count({
      where: {
        recipientUserId: userId,
        isRead: false,
        deletedAt: null,
      },
    });
  },

  /**
   * Paginated list of notifications for a user, with optional filters.
   * @param {Object} params
   * @param {string} params.userId - Recipient user UUID.
   * @param {number} params.page
   * @param {number} params.pageSize
   * @param {boolean} [params.onlyUnread]
   * @param {string} [params.searchTerm] - Search in message text.
   * @param {string} [params.sortKey]
   * @param {string} [params.sortDirection]
   */
  async findByUser({
    userId,
    page,
    pageSize,
    onlyUnread,
    searchTerm,
    sortKey,
    sortDirection,
  }) {
    const skip = (page - 1) * pageSize;
    const dbKey = notificationMapper.toSortKey(sortKey);
    const orderBy = { [dbKey]: sortDirection || "desc" };

    const where = {
      recipientUserId: userId,
      deletedAt: null,
      ...(onlyUnread && { isRead: false }),
      ...(searchTerm && {
        message: { contains: searchTerm, mode: "insensitive" },
      }),
    };

    const [totalCount, items] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: NOTIFICATION_INCLUDE,
      }),
    ]);

    return {
      items: notificationMapper.toDomainList(items),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  },
};
