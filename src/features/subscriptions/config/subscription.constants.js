/**
 * Centralized configuration for the Subscriptions (SubscriptionPlan) module.
 */

export const SUBSCRIPTION_CONFIG = {
  PATH: '/admin/suscripciones',
  TITLE: 'Planes de Suscripción',

  PERMISSIONS: {
    VIEW: 'subscriptions:view',
    READ: 'subscriptions:read',
    WRITE: 'subscriptions:create',
    UPDATE: 'subscriptions:update',
    DELETE: 'subscriptions:delete',
  },

  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    SEARCH_TAKE: 10,
  },

  // Static tier catalog — values must match the SubscriptionTier Prisma enum.
  TIER: {
    OPTIONS: [
      { value: 'BASIC_PASS', label: 'Pase Básico' },
      { value: 'PRO_MONTHLY', label: 'Pro Mensual' },
      { value: 'VIP_ANNUAL', label: 'VIP Anual' },
    ],
    LABELS: {
      BASIC_PASS: 'Pase Básico',
      PRO_MONTHLY: 'Pro Mensual',
      VIP_ANNUAL: 'VIP Anual',
    },
    BADGES: {
      BASIC_PASS: 'bg-slate-100 text-slate-700',
      PRO_MONTHLY: 'bg-blue-100 text-blue-700',
      VIP_ANNUAL: 'bg-amber-100 text-amber-700',
    },
  },

  UI: {
    ITEMS_PER_PAGE: 10,
    LABELS: {
      CLEAN_BUTTON: 'Limpiar',
      FORM: {
        FIELDS: {
          NAME: 'Nombre',
          TIER: 'Nivel',
          PRICE: 'Precio',
          MATCHES_INCLUDED: 'Partidos incluidos',
          PRIORITY_BOOKING: 'Reserva prioritaria',
          DESCRIPTION: 'Descripción',
        },
        PLACEHOLDERS: {
          NAME: 'Ej: Pase Básico',
          TIER: 'Seleccionar nivel',
          PRICE: 'Ej: 15.00',
          MATCHES_INCLUDED: 'Ej: 10',
          DESCRIPTION: 'Descripción opcional del plan...',
        },
        PRIORITY_BOOKING_DESCRIPTION:
          'Si está activo, los miembros con este plan reservan cupos antes que el público general.',
        DELETE_DIALOG: {
          TITLE: '¿Estás seguro?',
          DESCRIPTION: 'Esta acción eliminará el plan de suscripción. No se puede deshacer.',
          CANCEL: 'Cancelar',
          SUBMIT: 'Eliminar',
        },
        DIALOG: {
          TITLE_CREATE: 'Nuevo Plan',
          TITLE_EDIT: 'Editar Plan',
          DESCRIPTION_CREATE: 'Completa el formulario para registrar un nuevo plan de suscripción.',
          DESCRIPTION_EDIT: 'Modifica la información del plan existente.',
        },
        SUBMIT: 'Crear Plan',
        UPDATE: 'Actualizar Plan',
        SAVING: 'Guardando...',
      },
      TABLE: {
        NAME: 'Plan',
        TIER: 'Nivel',
        PRICE: 'Precio',
        MATCHES_INCLUDED: 'Partidos incluidos',
        PRIORITY_BOOKING: 'Reserva prioritaria',
        ACTIONS: 'Acciones',
        EMPTY: 'No hay planes de suscripción registrados.',
        EMPTY_SEARCH: 'No se encontraron planes con los criterios de búsqueda.',
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: 'Buscar planes...',
        NEW_BUTTON: 'Nuevo Plan',
        SEARCH_LABEL: 'Búsqueda de Planes',
        DIVIDER_SEARCH: 'Buscar por Nombre',
        DIVIDER_ACTIONS: 'Gestión de Planes',
      },
      DESCRIPTION: 'Administra los planes de suscripción de PlayMatch.',
      MESSAGES: {
        SUCCESS: {
          CREATE: 'Plan creado exitosamente.',
          UPDATE: 'Plan actualizado exitosamente.',
          DELETE: 'Plan eliminado exitosamente.',
        },
        ERROR: {
          LOAD: 'No se pudieron obtener los planes de suscripción.',
          CREATE: 'Error al crear el plan.',
          UPDATE: 'Error al actualizar el plan.',
          DELETE: 'Error al eliminar el plan.',
        },
      },
    },
  },
};
