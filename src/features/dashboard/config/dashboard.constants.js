/**
 * Centralized configuration for the Caimanera Dashboard.
 * Read-only dashboard — no CRUD operations.
 */

export const DASHBOARD_CONFIG = {
  PATH: '/',
  TITLE: 'Caimanera',

  METADATA: {
    DESCRIPTION: 'Panel de inicio de Caimanera — indicadores deportivos en tiempo real.',
  },

  UI: {
    LOCALE: 'es-VE',
    LABELS: {
      DESCRIPTION: 'Vista general de la actividad deportiva.',
      STATS: {
        COURTS: 'Canchas',
        MATCHES: 'Partidos',
        OPEN_MATCHES: 'Partidos Abiertos',
        PARTICIPANTS: 'Participantes',
        ACTIVE_SUBSCRIPTIONS: 'Suscripciones Activas',
      },
      ERROR: {
        LOAD: 'No se pudieron cargar los datos del dashboard.',
      },
    },
  },
};
