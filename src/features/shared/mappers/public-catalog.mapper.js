/**
 * Mapper for the public catalog (matches and venues) shared by the player
 * surfaces: home, match search, match detail and venue pages.
 *
 * Public objects deliberately exclude participant names and other PII.
 */

import {
  daysFromToday,
  formatDateShort,
  formatDateTime,
  formatTime,
  isPastDate,
  zonedDateKey,
} from "@/features/shared/lib/datetime";

function getConfirmedCount(participants = []) {
  return participants.filter((participant) => participant.status === "CONFIRMED").length;
}

function getWaitlistCount(participants = []) {
  return participants.filter((participant) => participant.status === "WAITLIST").length;
}

function resolveDisplayStatus(status, scheduledAt) {
  if (status === "CANCELED") return "CANCELED";
  if (status === "COMPLETED") return "COMPLETED";
  if (isPastDate(scheduledAt)) return "COMPLETED";
  return status || "OPEN";
}

export const publicCatalogMapper = {
  /**
   * Public match card. Includes availability, my enrollment and relative day.
   */
  toPublicMatch(raw, currentUserId = null) {
    if (!raw) return null;

    const confirmedCount = getConfirmedCount(raw.participants);
    const waitlistCount = getWaitlistCount(raw.participants);
    const capacity = raw.capacity ?? 0;
    const slotsLeft = Math.max(0, capacity - confirmedCount);
    const isFull = slotsLeft === 0 || raw.status === "FULL";
    const mine = currentUserId
      ? (raw.participants || []).find((participant) => participant.userId === currentUserId)
      : null;

    return {
      id: raw.id,
      title: raw.title,
      sport: raw.sport,
      status: resolveDisplayStatus(raw.status, raw.scheduledAt),
      rawStatus: raw.status,
      scheduledAt: raw.scheduledAt ? new Date(raw.scheduledAt).toISOString() : null,
      dateLabel: formatDateShort(raw.scheduledAt),
      timeLabel: formatTime(raw.scheduledAt),
      dateTimeLabel: formatDateTime(raw.scheduledAt),
      dateKey: zonedDateKey(raw.scheduledAt),
      daysUntil: daysFromToday(raw.scheduledAt),
      durationMins: raw.durationMins,
      capacity,
      pricePerSlot: raw.pricePerSlot,
      allowSubscription: raw.allowSubscription,
      confirmedCount,
      waitlistCount,
      slotsLeft,
      isFull,
      isPast: isPastDate(raw.scheduledAt),
      isEnrolled: Boolean(mine),
      myStatus: mine?.status || null,
      hostName: raw.host?.firstName || null,
      coverPhoto: raw.court?.photos?.[0]?.url || null,
      court: raw.court
        ? {
            id: raw.court.id,
            name: raw.court.name,
            address: raw.court.address || null,
            sport: raw.court.sport,
            latitude: raw.court.latitude,
            longitude: raw.court.longitude,
            coverPhoto: raw.court.photos?.[0]?.url || null,
          }
        : null,
    };
  },

  toPublicMatchList(list, currentUserId = null) {
    if (!Array.isArray(list)) return [];
    return list.map((item) => this.toPublicMatch(item, currentUserId));
  },

  /**
   * Public match detail — richer venue data, still no participant identities.
   */
  toPublicMatchDetail(raw, currentUserId = null) {
    if (!raw) return null;
    const card = this.toPublicMatch(raw, currentUserId);

    return {
      ...card,
      description: raw.court?.description || null,
      photos: (raw.court?.photos || []).map((photo) => photo.url).filter(Boolean),
      court: raw.court
        ? {
            ...card.court,
            description: raw.court.description || null,
            hourlyRate: raw.court.hourlyRate,
            managerName: raw.court.manager
              ? `${raw.court.manager.firstName} ${raw.court.manager.lastName || ""}`.trim()
              : null,
            photos: (raw.court.photos || []).map((photo) => photo.url).filter(Boolean),
          }
        : null,
    };
  },

  /**
   * Public venue card with its upcoming match count.
   */
  toPublicCourt(raw) {
    if (!raw) return null;

    return {
      id: raw.id,
      name: raw.name,
      sport: raw.sport,
      description: raw.description || null,
      address: raw.address || null,
      latitude: raw.latitude,
      longitude: raw.longitude,
      hourlyRate: raw.hourlyRate,
      isActive: raw.isActive,
      photo: raw.photos?.[0]?.url || null,
      photos: (raw.photos || []).map((photo) => photo.url).filter(Boolean),
      upcomingMatches: raw.matches?.length ?? 0,
    };
  },

  toPublicCourtList(list) {
    if (!Array.isArray(list)) return [];
    return list.map((item) => this.toPublicCourt(item));
  },

  /**
   * Public venue detail: venue data plus its upcoming match cards.
   */
  toPublicCourtDetail(raw, currentUserId = null) {
    if (!raw) return null;
    const court = this.toPublicCourt(raw);

    return {
      ...court,
      photos: (raw.photos || []).map((photo) => photo.url).filter(Boolean),
      matches: this.toPublicMatchList(raw.matches, currentUserId),
    };
  },

  /**
   * Active subscription summary for the current player.
   */
  toSubscription(raw) {
    if (!raw) return null;
    return {
      id: raw.id,
      planName: raw.plan?.name || null,
      tier: raw.plan?.tier || null,
      remainingMatches: raw.remainingMatches,
      endDate: raw.endDate ? new Date(raw.endDate).toISOString() : null,
      isActive: raw.isActive,
    };
  },

  toSortKey(domainKey) {
    const map = {
      title: "title",
      sport: "sport",
      scheduledAt: "scheduledAt",
      pricePerSlot: "pricePerSlot",
    };
    return map[domainKey] || "scheduledAt";
  },
};
