/**
 * Centralized configuration for the Caimanera admin dashboard.
 * Read-only dashboard — no CRUD operations.
 */

export const DASHBOARD_CONFIG = {
  PATH: '/admin',
  PERMISSION: 'matches:create',
  TITLE: 'Panel de control',

  METADATA: {
    DESCRIPTION: 'Resumen operativo de Caimanera: canchas, partidos y jugadores.',
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
