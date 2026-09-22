/**
 * Centralized configuration for Notifications module.
 */

export const NOTIFICATION_CONFIG = {
  PATH: '/admin/notificaciones',
  TITLE: 'Notificaciones',

  PERMISSIONS: {
    VIEW: 'notifications:view',
    READ: 'notifications:read',
    MARK_READ: 'notifications:mark_read',
    MARK_ALL_READ: 'notifications:mark_all_read',
  },

  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },

  POLLING: {
    /** Interval in ms between unread count checks */
    INTERVAL_MS: 10000,
    /** Stale-while-revalidate threshold (ms). If last fetch < this, reuse cache. */
    SWR_THRESHOLD_MS: 5000,
  },

  TYPES: {
    CREACION: 'CREACION',
    REMISION: 'REMISION',
    CIERRE: 'CIERRE',
    SEGUIMIENTO: 'SEGUIMIENTO',
  },

  TEMPLATES: {
    CREACION: (caseNumber) =>
      `Se registró el caso ${caseNumber}`,
    REMISION: (caseNumber, originName) =>
      `El caso ${caseNumber} te fue remitido desde ${originName}`,
    CIERRE: (caseNumber) =>
      `Tu caso ${caseNumber} fue cerrado`,
    SEGUIMIENTO: (caseNumber) =>
      `Nuevo seguimiento en tu caso ${caseNumber}`,
  },

  UI: {
    LABELS: {
      BELL: {
        ARIA_LABEL: 'Notificaciones',
        ZERO_COUNT: 'Sin notificaciones nuevas',
        UNREAD_COUNT: (n) => `${n} notificaci${n === 1 ? 'ón' : 'ones'} sin leer`,
        TOOLTIP: 'Notificaciones',
        TOAST_DESCRIPTION: 'Abre la campana para ver tus notificaciones',
      },
      LIST: {
        TITLE: 'Notificaciones',
        EMPTY: 'No tienes notificaciones.',
        MARK_ALL_READ: 'Marcar todas como leídas',
        MARK_READ: 'Marcar como leída',
        UNREAD_BADGE: 'Nueva',
        TIME_JUST_NOW: 'Ahora',
        TIME_MINUTES: (n) => `Hace ${n} min`,
        TIME_HOURS: (n) => `Hace ${n}h`,
        TIME_DAYS: (n) => `Hace ${n}d`,
      },
      TABLE: {
        MESSAGE: 'Mensaje',
        TYPE: 'Tipo',
        CASE: 'Caso',
        DATE: 'Fecha',
        STATUS: 'Estado',
        EMPTY: 'No hay notificaciones.',
        EMPTY_SEARCH: 'No se encontraron notificaciones.',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar notificaciones...',
      },
      TYPES_MAP: {
        CREACION: 'Creación',
        REMISION: 'Remisión',
        CIERRE: 'Cierre',
        SEGUIMIENTO: 'Seguimiento',
      },
      STATUS: {
        READ: 'Leída',
        UNREAD: 'No leída',
      },
      MESSAGES: {
        SUCCESS: {
          MARK_READ: 'Notificación marcada como leída.',
          MARK_ALL_READ: 'Todas las notificaciones marcadas como leídas.',
        },
        ERROR: {
          LOAD: 'No se pudieron cargar las notificaciones.',
          MARK_READ: 'Error al marcar la notificación.',
          MARK_ALL_READ: 'Error al marcar todas las notificaciones.',
        },
      },
    },
  },
};
