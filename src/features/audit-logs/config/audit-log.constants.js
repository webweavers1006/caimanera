/**
 * Centralized configuration for Audit Logs module.
 */

export const AUDIT_LOG_CONFIG = {
  PATH: '/admin/auditoria',
  TITLE: 'Auditoría',

  PERMISSIONS: {
    VIEW: 'audit_logs:view',
    READ: 'audit_logs:read',
  },

  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },

  UI: {
    LABELS: {
      CLEAN_BUTTON: 'Limpiar',
      TABLE: {
        NAME: 'Registro',
        DATE: 'Fecha',
        TIME: 'Hora',
        USER: 'Usuario',
        ACTION: 'Acción',
        EMPTY: 'No hay registros de auditoría.',
        EMPTY_SEARCH: 'No se encontraron registros con los criterios de búsqueda.',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar por acción...',
        SEARCH_LABEL: 'Búsqueda de Auditoría',
        DIVIDER_SEARCH: 'Buscar por Acción',
        DIVIDER_ACTIONS: 'Filtros',
      },
      DESCRIPTION: 'Registro de acciones realizadas en el sistema.',
      MESSAGES: {
        ERROR: {
          LOAD: 'No se pudieron cargar los registros de auditoría.',
        },
      },
    },
  },
};
