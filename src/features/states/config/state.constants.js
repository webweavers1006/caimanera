/**
 * Centralized configuration for the States module.
 * Select-only feature — used for dropdown cascading.
 */

export const STATE_CONFIG = {
  PATH: '/admin/estados',
  TITLE: 'Estados',

  PERMISSIONS: {
    VIEW: 'states:view',
    READ: 'states:read',
  },

  UI: {
    LABELS: {
      NAME: 'Estado',
      SELECT_PLACEHOLDER: 'Seleccionar estado...',
      SEARCH_PLACEHOLDER: 'Buscar estado...',
    },
  },
}
