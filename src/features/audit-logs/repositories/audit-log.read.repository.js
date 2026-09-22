import prisma from "@/features/shared/lib/prisma";
import { auditLogMapper } from "../mappers/audit-log.mapper";
import { parseDateInput, parseDateInputEndOfDay } from "@/features/shared/lib/date-utils";

const AUDIT_INCLUDE = {
  user: { select: { id: true, firstName: true, lastName: true } },
};

export const auditLogReadRepository = {
  /**
   * Checks if a user has already viewed a specific case.
   * Used to avoid duplicate "first view" audit entries.
   * @param {string} userId - User UUID.
   * @param {number} caseId - Case ID.
   * @returns {Promise<boolean>}
   */
  async hasUserViewedCase(userId, caseId) {
    const count = await prisma.auditLog.count({
      where: {
        userId,
        action: { startsWith: `Visto caso #${caseId} ` },
      },
    });
    return count > 0;
  },

  /**
   * Paginated list with optional filters.
   * @param {Object} params
   * @param {number} params.page
   * @param {number} params.pageSize
   * @param {string} [params.searchTerm] - Search in action text.
   * @param {string} [params.dateFrom] - ISO date string for range start.
   * @param {string} [params.dateTo] - ISO date string for range end.
   * @param {string} [params.userId] - Filter by user UUID.
   * @param {string} [params.sortKey]
   * @param {string} [params.sortDirection]
   */
  async findMany({ page, pageSize, searchTerm, dateFrom, dateTo, userId, sortKey, sortDirection }) {
    const skip = (page - 1) * pageSize;
    const dbKey = auditLogMapper.toSortKey(sortKey);
    const orderBy = { [dbKey]: sortDirection || "desc" };

    const where = {
      ...(searchTerm && {
        action: { contains: searchTerm, mode: "insensitive" },
      }),
      ...(userId && { userId }),
      ...(dateFrom || dateTo) && {
        date: {
          ...(dateFrom && { gte: parseDateInput(dateFrom) }),
          ...(dateTo && { lte: parseDateInputEndOfDay(dateTo) }),
        },
      },
    };

    const [totalCount, items] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({ where, skip, take: pageSize, orderBy, include: AUDIT_INCLUDE }),
    ]);

    return {
      items: auditLogMapper.toDomainList(items),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  },
};
