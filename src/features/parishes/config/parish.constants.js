/**
 * Centralized configuration for the Parishes module.
 * Select-only feature — used for dropdown cascading (municipality → parish).
 */

export const PARISH_CONFIG = {
  PATH: '/admin/parroquias',
  TITLE: 'Parroquias',

  PERMISSIONS: {
    VIEW: 'parishes:view',
    READ: 'parishes:read',
  },

  UI: {
    LABELS: {
      NAME: 'Parroquia',
      SELECT_PLACEHOLDER: 'Seleccionar parroquia...',
      SEARCH_PLACEHOLDER: 'Buscar parroquia...',
    },
  },
}
