/**
 * Centralized configuration for the Municipalities module.
 * Select-only feature — used for dropdown cascading (state → municipality).
 */

export const MUNICIPALITY_CONFIG = {
  PATH: '/admin/municipios',
  TITLE: 'Municipios',

  PERMISSIONS: {
    VIEW: 'municipalities:view',
    READ: 'municipalities:read',
  },

  UI: {
    LABELS: {
      NAME: 'Municipio',
      SELECT_PLACEHOLDER: 'Seleccionar municipio...',
      SEARCH_PLACEHOLDER: 'Buscar municipio...',
    },
  },
}
