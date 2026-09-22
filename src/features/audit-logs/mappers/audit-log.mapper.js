import { parseDateInput, nowVE } from "@/features/shared/lib/date-utils";

/**
 * Mapper for the AuditLog entity.
 */

export const auditLogMapper = {
  toDomain(raw) {
    if (!raw) return null;
    return {
      id: raw.id,
      userId: raw.userId,
      userName: raw.user
        ? `${raw.user.firstName || ""} ${raw.user.lastName || ""}`.trim() || null
        : null,
      action: raw.action,
      date: raw.date,
      time: raw.time,
      createdAt: raw.createdAt,
    };
  },

  toDomainList(list) {
    if (!list) return [];
    return list.map(this.toDomain);
  },

  toPersistence(domain) {
    return {
      userId: domain.userId || null,
      action: domain.action?.trim().toUpperCase() || null,
      date:
        domain.date instanceof Date
          ? domain.date
          : domain.date
            ? parseDateInput(domain.date)
            : nowVE(),
      time: domain.time || null,
    };
  },

  toSortKey(domainKey) {
    const map = { date: "date", createdAt: "createdAt", user: "userId" };
    return map[domainKey] || "createdAt";
  },
};
