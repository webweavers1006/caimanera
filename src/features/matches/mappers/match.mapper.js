/**
 * Mapper for the Match entity.
 * Centralizes transformation between Prisma and Domain.
 */

import {
  formatDateShort,
  formatDateTime,
  formatTime,
  isPastDate,
} from "@/features/shared/lib/datetime";

function resolveDisplayStatus(status, scheduledAt) {
  if (status === "CANCELED") return "CANCELED";
  if (status === "COMPLETED") return "COMPLETED";
  if (isPastDate(scheduledAt)) return "COMPLETED";
  return status || "OPEN";
}

function getCounts(participants = []) {
  const confirmedCount = participants.filter((p) => p.status === "CONFIRMED").length;
  const waitlistCount = participants.filter((p) => p.status === "WAITLIST").length;
  return { confirmedCount, waitlistCount };
}

export const matchMapper = {
  /**
   * Transforms a Prisma record into a Domain object.
   */
  toDomain(raw, currentUserId = null) {
    if (!raw) return null;

    const { confirmedCount, waitlistCount } = getCounts(raw.participants);
    const capacity = raw.capacity ?? 0;
    const slotsLeft = Math.max(0, capacity - confirmedCount);
    const mine = currentUserId
      ? (raw.participants || []).find((p) => p.userId === currentUserId)
      : null;

    return {
      id: raw.id,
      title: raw.title,
      sport: raw.sport,
      scheduledAt: raw.scheduledAt ? new Date(raw.scheduledAt).toISOString() : null,
      scheduledAtDisplay: formatDateTime(raw.scheduledAt),
      dateLabel: formatDateShort(raw.scheduledAt),
      timeLabel: formatTime(raw.scheduledAt),
      durationMins: raw.durationMins,
      capacity,
      pricePerSlot: raw.pricePerSlot,
      allowSubscription: raw.allowSubscription,
      status: resolveDisplayStatus(raw.status, raw.scheduledAt),
      rawStatus: raw.status,
      hostId: raw.hostId,
      hostName: raw.host
        ? `${raw.host.firstName} ${raw.host.lastName || ""}`.trim()
        : null,
      courtId: raw.courtId,
      courtName: raw.court?.name || null,
      court: raw.court
        ? {
            id: raw.court.id,
            name: raw.court.name,
            address: raw.court.address || null,
            latitude: raw.court.latitude,
            longitude: raw.court.longitude,
            coverPhoto: raw.court.photos?.[0]?.url || null,
          }
        : null,
      coverPhoto: raw.court?.photos?.[0]?.url || null,
      confirmedCount,
      waitlistCount,
      slotsLeft,
      isFull: slotsLeft === 0 || raw.status === "FULL",
      isPast: isPastDate(raw.scheduledAt),
      isEnrolled: Boolean(mine),
      myStatus: mine?.status || null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  },

  /**
   * Transforms a list of Prisma records.
   */
  toDomainList(list, currentUserId = null) {
    if (!list) return [];
    return list.map((item) => this.toDomain(item, currentUserId));
  },

  /**
   * Transforms a Prisma record (with court + participants) into a detail object.
   */
  toDetail(raw, currentUserId = null) {
    if (!raw) return null;
    const base = this.toDomain(raw, currentUserId);
    return {
      ...base,
      court: raw.court
        ? {
            id: raw.court.id,
            name: raw.court.name,
            description: raw.court.description,
            sport: raw.court.sport,
            address: raw.court.address,
            latitude: raw.court.latitude,
            longitude: raw.court.longitude,
            hourlyRate: raw.court.hourlyRate,
            isActive: raw.court.isActive,
            managerName: raw.court.manager
              ? `${raw.court.manager.firstName} ${raw.court.manager.lastName || ""}`.trim()
              : null,
            photos: (raw.court.photos || []).map((p) => ({ id: p.id, url: p.url })),
          }
        : null,
      participants: (raw.participants || []).map((p) => ({
        id: p.id,
        userId: p.userId,
        userName: p.user
          ? `${p.user.firstName} ${p.user.lastName || ""}`.trim()
          : null,
        position: p.position,
        status: p.status,
        paymentType: p.paymentType,
      })),
    };
  },

  /**
   * Transforms a Domain object into a Prisma write payload.
   * scheduledAt arrives as a datetime-local string and is parsed into a Date.
   */
  toPersistence(domain) {
    return {
      title: domain.title?.trim(),
      sport: domain.sport?.trim(),
      scheduledAt: domain.scheduledAt ? new Date(domain.scheduledAt) : undefined,
      durationMins:
        domain.durationMins != null && domain.durationMins !== ""
          ? Number(domain.durationMins)
          : 60,
      capacity:
        domain.capacity != null && domain.capacity !== ""
          ? Number(domain.capacity)
          : undefined,
      pricePerSlot:
        domain.pricePerSlot != null && domain.pricePerSlot !== ""
          ? Number(domain.pricePerSlot)
          : undefined,
      allowSubscription: domain.allowSubscription ?? true,
      status: domain.status || "OPEN",
      hostId: domain.hostId,
      courtId: domain.courtId,
    };
  },

  /**
   * Maps a domain-level sort key to the database column name.
   */
  toSortKey(domainKey) {
    const map = {
      title: "title",
      sport: "sport",
      scheduledAt: "scheduledAt",
      status: "status",
      capacity: "capacity",
      createdAt: "createdAt",
    };
    return map[domainKey] || "scheduledAt";
  },
};
