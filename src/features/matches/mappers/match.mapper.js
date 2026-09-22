/**
 * Mapper for the Match entity.
 * Centralizes transformation between Prisma and Domain.
 */

// Formats a Date server-side to avoid client-side hydration mismatches.
function formatDateTime(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("es-VE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export const matchMapper = {
  /**
   * Transforms a Prisma record into a Domain object.
   */
  toDomain(raw) {
    if (!raw) return null;
    return {
      id: raw.id,
      title: raw.title,
      sport: raw.sport,
      scheduledAt: raw.scheduledAt ? new Date(raw.scheduledAt).toISOString() : null,
      scheduledAtDisplay: formatDateTime(raw.scheduledAt),
      durationMins: raw.durationMins,
      capacity: raw.capacity,
      pricePerSlot: raw.pricePerSlot,
      allowSubscription: raw.allowSubscription,
      status: raw.status,
      hostId: raw.hostId,
      hostName: raw.host
        ? `${raw.host.firstName} ${raw.host.lastName || ""}`.trim()
        : null,
      courtId: raw.courtId,
      courtName: raw.court?.name || null,
      coverPhoto: raw.court?.photos?.[0]?.url || null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  },

  /**
   * Transforms a list of Prisma records.
   */
  toDomainList(list) {
    if (!list) return [];
    return list.map(this.toDomain);
  },

  /**
   * Transforms a Prisma record (with court + participants) into a detail object.
   */
  toDetail(raw) {
    if (!raw) return null;
    const base = this.toDomain(raw);
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
