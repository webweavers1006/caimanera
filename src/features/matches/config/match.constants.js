/**
 * Centralized configuration for the Matches module.
 */

export const MATCH_CONFIG = {
  PATH: '/admin/partidos',
  TITLE: 'Partidos',

  PERMISSIONS: {
    VIEW: 'matches:view',
    READ: 'matches:read',
    WRITE: 'matches:create',
    UPDATE: 'matches:update',
    DELETE: 'matches:delete',
  },

  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    SEARCH_TAKE: 10,
  },

  // Static status catalog — values must match the MatchStatus Prisma enum.
  STATUS: {
    OPTIONS: [
      { value: 'OPEN', label: 'Abierto' },
      { value: 'FULL', label: 'Lleno' },
      { value: 'IN_PROGRESS', label: 'En curso' },
      { value: 'COMPLETED', label: 'Completado' },
      { value: 'CANCELED', label: 'Cancelado' },
    ],
    LABELS: {
      OPEN: 'Abierto',
      FULL: 'Lleno',
      IN_PROGRESS: 'En curso',
      COMPLETED: 'Completado',
      CANCELED: 'Cancelado',
    },
    BADGES: {
      OPEN: 'bg-emerald-100 text-emerald-700',
      FULL: 'bg-amber-100 text-amber-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-slate-100 text-slate-700',
      CANCELED: 'bg-red-100 text-red-700',
    },
  },

  UI: {
    ITEMS_PER_PAGE: 10,
    LABELS: {
      CLEAN_BUTTON: 'Limpiar',
      FORM: {
        FIELDS: {
          TITLE: 'Título',
          SPORT: 'Deporte',
          SCHEDULED_AT: 'Fecha y hora',
          DURATION_MINS: 'Duración (min)',
          CAPACITY: 'Cupos',
          PRICE_PER_SLOT: 'Precio por cupo',
          ALLOW_SUBSCRIPTION: 'Permite suscripción',
          STATUS: 'Estado',
          HOST: 'Organizador',
          COURT: 'Cancha',
        },
        PLACEHOLDERS: {
          TITLE: 'Ej: Fútbol 5 — Equipo A vs Equipo B',
          SPORT: 'Ej: Fútbol 5',
          SCHEDULED_AT: 'Selecciona fecha y hora',
          DURATION_MINS: 'Ej: 60',
          CAPACITY: 'Ej: 10',
          PRICE_PER_SLOT: 'Ej: 5',
          HOST: 'Seleccionar organizador...',
          COURT: 'Seleccionar cancha...',
          STATUS: 'Seleccionar estado',
        },
        ALLOW_SUBSCRIPTION_DESCRIPTION:
          'Si está activo, los jugadores con membresía pueden inscribirse usando su saldo.',
        DELETE_DIALOG: {
          TITLE: '¿Estás seguro?',
          DESCRIPTION: 'Esta acción eliminará el partido. No se puede deshacer.',
          CANCEL: 'Cancelar',
          SUBMIT: 'Eliminar',
        },
        DIALOG: {
          TITLE_CREATE: 'Nuevo Partido',
          TITLE_EDIT: 'Editar Partido',
          DESCRIPTION_CREATE: 'Completa el formulario para programar un nuevo partido.',
          DESCRIPTION_EDIT: 'Modifica la información del partido existente.',
        },
        SUBMIT: 'Crear Partido',
        UPDATE: 'Actualizar Partido',
        SAVING: 'Guardando...',
      },
      TABLE: {
        NAME: 'Partido',
        TITLE: 'Título',
        SPORT: 'Deporte',
        SCHEDULED_AT: 'Fecha',
        HOST: 'Organizador',
        COURT: 'Cancha',
        STATUS: 'Estado',
        CAPACITY: 'Cupos',
        ACTIONS: 'Acciones',
        VIEW: 'Ver',
        EMPTY: 'No hay partidos registrados.',
        EMPTY_SEARCH: 'No se encontraron partidos con los criterios de búsqueda.',
      },
      CARD: {
        JOIN: 'Inscribirse',
        SLOTS: 'cupos',
        PRICE: 'por jugador',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar partidos...',
        NEW_BUTTON: 'Nuevo Partido',
        SEARCH_LABEL: 'Búsqueda de Partidos',
        DIVIDER_SEARCH: 'Buscar por Título o Deporte',
        DIVIDER_ACTIONS: 'Gestión de Partidos',
      },
      DESCRIPTION: 'Administra los partidos deportivos del sistema.',
      DETAIL: {
        BREADCRUMB_BACK: 'Partidos',
        TABS: {
          COURT: 'Cancha',
          PARTICIPANTS: 'Participantes',
        },
        STATS: {
          CAPACITY: 'Cupos',
          PRICE: 'Precio por cupo',
          PRICE_SUBTITLE: 'por jugador',
          DURATION: 'Duración',
          DURATION_SUBTITLE: 'minutos',
          CONFIRMED: 'Confirmados',
          CONFIRMED_SUBTITLE: 'inscritos',
        },
        SECTIONS: {
          COURT: 'Cancha',
          PHOTOS: 'Fotos',
        },
        FIELDS: {
          SPORT: 'Deporte',
          SCHEDULED_AT: 'Fecha y hora',
          DURATION: 'Duración',
          CAPACITY: 'Cupos',
          PRICE: 'Precio por cupo',
          ALLOW_SUBSCRIPTION: 'Permite suscripción',
          HOST: 'Organizador',
          COURT_NAME: 'Nombre',
          COURT_SPORT: 'Deporte',
          COURT_ADDRESS: 'Dirección',
          COURT_RATE: 'Tarifa por hora',
          COURT_MANAGER: 'Encargado',
          COURT_COORDS: 'Coordenadas',
        },
        PARTICIPANTS: {
          NAME: 'Jugador',
          POSITION: 'Posición',
          STATUS: 'Estado',
          PAYMENT: 'Pago',
          EMPTY: 'Sin participantes aún.',
          NO_POSITION: 'Sin posición',
        },
      },
      MESSAGES: {
        SUCCESS: {
          CREATE: 'Partido creado exitosamente.',
          UPDATE: 'Partido actualizado exitosamente.',
          DELETE: 'Partido eliminado exitosamente.',
        },
        ERROR: {
          LOAD: 'No se pudieron obtener los partidos.',
          CREATE: 'Error al crear el partido.',
          UPDATE: 'Error al actualizar el partido.',
          DELETE: 'Error al eliminar el partido.',
          NOT_FOUND: 'No se encontró el partido.',
          INVALID_ID: 'Identificador de partido inválido.',
        },
      },
    },
  },
};
