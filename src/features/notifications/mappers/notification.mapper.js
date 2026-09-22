import { nowVE } from "@/features/shared/lib/date-utils";

/**
 * Mapper for the Notification entity.
 *
 * DB fields (via @map): tipo, mensaje, leida, usuario_destino_id,
 *   usuario_accion_id, rol_accion_id, caso_autor_id, direccion_origen_id,
 *   creado_en, actualizado_en, eliminado_en.
 *
 * Domain fields (English): type, message, isRead, recipientUserId,
 *   actionUserId, actionRoleId, caseAuthorUserId, originDirectionId,
 *   createdAt, updatedAt, deletedAt.
 */

export const notificationMapper = {
  toDomain(raw) {
    if (!raw) return null;
    return {
      id: raw.id,
      caseId: raw.caseId ?? null,
      caseNumber: raw.case?.requestNumber ?? null,
      type: raw.type,
      message: raw.message,
      isRead: raw.isRead,
      recipientUserId: raw.recipientUserId,
      actionUser: raw.actionUser
        ? {
            id: raw.actionUser.id,
            name: [raw.actionUser.firstName, raw.actionUser.lastName]
              .filter(Boolean).join(" ") || null,
          }
        : null,
      actionRole: raw.actionRole?.name ?? null,
      originDirection: raw.originDirection?.name ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  },

  toDomainList(list) {
    if (!list) return [];
    return list.map(this.toDomain);
  },

  toPersistence(domain) {
    return {
      caseId: domain.caseId ?? null,
      type: domain.type,
      message: domain.message?.trim().toUpperCase() ?? "",
      recipientUserId: domain.recipientUserId ?? null,
      actionUserId: domain.actionUserId ?? null,
      actionRoleId: domain.actionRoleId ?? null,
      caseAuthorUserId: domain.caseAuthorUserId ?? null,
      originDirectionId: domain.originDirectionId ?? null,
      isRead: domain.isRead ?? false,
    };
  },

  /**
   * Maps a domain-level sort key to the DB column name.
   * @param {string} domainKey
   * @returns {string} Prisma column name
   */
  toSortKey(domainKey) {
    const map = {
      createdAt: "createdAt",
      type: "type",
      isRead: "isRead",
    };
    return map[domainKey] || "createdAt";
  },
};
