/**
 * Centralized configuration for the Participants module.
 */

export const PARTICIPANT_CONFIG = {
  PATH: '/admin/participantes',
  TITLE: 'Participantes',

  PERMISSIONS: {
    VIEW: 'participants:view',
    READ: 'participants:read',
    WRITE: 'participants:create',
    UPDATE: 'participants:update',
    DELETE: 'participants:delete',
    SELF_ENROLL: 'participants:self_enroll',
  },

  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    SEARCH_TAKE: 10,
  },

  // Static status catalog — values must match the ParticipantStatus Prisma enum.
  STATUS: {
    OPTIONS: [
      { value: 'CONFIRMED', label: 'Confirmado' },
      { value: 'WAITLIST', label: 'Lista de espera' },
    ],
    LABELS: {
      CONFIRMED: 'Confirmado',
      WAITLIST: 'Lista de espera',
    },
    BADGES: {
      CONFIRMED: 'bg-emerald-400/15 text-emerald-300',
      WAITLIST: 'bg-amber-400/15 text-amber-300',
    },
  },

  // Payment type — values must match the PaymentType Prisma enum.
  PAYMENT_TYPE: {
    OPTIONS: [
      { value: 'PAY_PER_MATCH', label: 'Pago por partido' },
      { value: 'SUBSCRIPTION_CREDIT', label: 'Crédito de suscripción' },
    ],
    LABELS: {
      PAY_PER_MATCH: 'Pago por partido',
      SUBSCRIPTION_CREDIT: 'Crédito de suscripción',
    },
    BADGES: {
      PAY_PER_MATCH: 'bg-blue-400/15 text-blue-300',
      SUBSCRIPTION_CREDIT: 'bg-violet-400/15 text-violet-300',
    },
  },

  POSITIONS: {
    OPTIONS: [
      { value: 'Portero', label: 'Portero' },
      { value: 'Defensa', label: 'Defensa' },
      { value: 'Mediocampista', label: 'Mediocampista' },
      { value: 'Delantero', label: 'Delantero' },
    ],
  },

  UI: {
    ITEMS_PER_PAGE: 10,
    LABELS: {
      CLEAN_BUTTON: 'Limpiar',
      FORM: {
        FIELDS: {
          USER: 'Jugador',
          MATCH: 'Partido',
          STATUS: 'Estado',
          PAYMENT_TYPE: 'Tipo de pago',
          POSITION: 'Posición',
        },
        PLACEHOLDERS: {
          USER: 'Seleccionar jugador...',
          MATCH: 'Seleccionar partido...',
          STATUS: 'Seleccionar estado',
          PAYMENT_TYPE: 'Seleccionar tipo de pago',
          POSITION: 'Seleccionar posición',
        },
        DELETE_DIALOG: {
          TITLE: '¿Estás seguro?',
          DESCRIPTION: 'Esta acción eliminará la inscripción. No se puede deshacer.',
          CANCEL: 'Cancelar',
          SUBMIT: 'Eliminar',
        },
        DIALOG: {
          TITLE_CREATE: 'Nueva Inscripción',
          TITLE_EDIT: 'Editar Inscripción',
          DESCRIPTION_CREATE: 'Completa el formulario para inscribir a un jugador.',
          DESCRIPTION_EDIT: 'Modifica la información de la inscripción existente.',
        },
        SUBMIT: 'Crear Inscripción',
        UPDATE: 'Actualizar Inscripción',
        SAVING: 'Guardando...',
      },
      TABLE: {
        NAME: 'Participante',
        USER: 'Jugador',
        MATCH: 'Partido',
        POSITION: 'Posición',
        STATUS: 'Estado',
        PAYMENT_TYPE: 'Pago',
        ACTIONS: 'Acciones',
        EMPTY: 'No hay inscripciones registradas.',
        EMPTY_SEARCH: 'No se encontraron inscripciones con los criterios de búsqueda.',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar por jugador o partido...',
        NEW_BUTTON: 'Nueva Inscripción',
        SEARCH_LABEL: 'Búsqueda de Inscripciones',
        DIVIDER_SEARCH: 'Buscar por Jugador o Partido',
        DIVIDER_ACTIONS: 'Gestión de Inscripciones',
      },
      DESCRIPTION: 'Administra la inscripción de jugadores a los partidos.',
      MESSAGES: {
        SUCCESS: {
          CREATE: 'Inscripción creada exitosamente.',
          UPDATE: 'Inscripción actualizada exitosamente.',
          DELETE: 'Inscripción eliminada exitosamente.',
        },
        ERROR: {
          LOAD: 'No se pudieron obtener las inscripciones.',
          CREATE: 'Error al crear la inscripción.',
          UPDATE: 'Error al actualizar la inscripción.',
          DELETE: 'Error al eliminar la inscripción.',
        },
      },
    },
  },
};
