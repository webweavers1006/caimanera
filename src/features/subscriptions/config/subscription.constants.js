/**
 * Centralized configuration for the Subscriptions (SubscriptionPlan) module.
 */

export const SUBSCRIPTION_CONFIG = {
  PATH: '/admin/suscripciones',
  TITLE: 'Pases',

  PERMISSIONS: {
    VIEW: 'subscriptions:view',
    READ: 'subscriptions:read',
    WRITE: 'subscriptions:create',
    UPDATE: 'subscriptions:update',
    DELETE: 'subscriptions:delete',
    PURCHASE: 'subscriptions:purchase',
  },

  // Duration used when a purchase is confirmed. The plan model stores the
  // number of matches, not the duration; these are the business defaults.
  DURATION_DAYS: {
    BASIC_PASS: 30,
    PRO_MONTHLY: 30,
    VIP_ANNUAL: 365,
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
      BASIC_PASS: 'bg-muted text-muted-foreground',
      PRO_MONTHLY: 'bg-blue-400/15 text-blue-300',
      VIP_ANNUAL: 'bg-amber-400/15 text-amber-300',
    },
  },

  UI: {
    ITEMS_PER_PAGE: 10,
    PLAYER: {
      EYEBROW: 'Tu membresía',
      TITLE: 'Mi pase',
      SUBTITLE: 'Consulta tu pase activo, compra o renueva y revisa tu historial.',
      ACTIVE_TITLE: 'Pase activo',
      ACTIVE_EMPTY: 'No tienes un pase activo',
      ACTIVE_EMPTY_DESCRIPTION:
        'Compra un pase para reservar tus partidos con créditos y prioridad.',
      CREDITS: (remaining, total) => `${remaining} de ${total} partidos disponibles`,
      CREDITS_LEFT: (count) =>
        `${count} ${count === 1 ? 'partido disponible' : 'partidos disponibles'}`,
      VALID_UNTIL: (date) => `Vigente hasta ${date}`,
      PRIORITY: 'Reserva prioritaria',
      PLANS_TITLE: 'Planes disponibles',
      PLANS_SUBTITLE: 'Elige el pase que mejor se adapte a cómo juegas.',
      BUY: 'Comprar pase',
      RENEW: 'Renovar pase',
      INCLUDES: (count) =>
        `${count} ${count === 1 ? 'partido incluido' : 'partidos incluidos'}`,
      HISTORY_TITLE: 'Historial de pases',
      HISTORY_SUBTITLE: 'Tus compras y renovaciones anteriores.',
      HISTORY_EMPTY: 'Todavía no has comprado un pase.',
      PENDING_TITLE: 'Compras pendientes de validación',
      PENDING_DESCRIPTION:
        'El pago se registró y el pase se activará cuando el equipo lo confirme.',
      VIEW_PAYMENTS: 'Ver mis pagos',
      STATUS: {
        ACTIVE: 'Activo',
        EXPIRED: 'Vencido',
        DEPLETED: 'Sin créditos',
      },
      PURCHASE: {
        TITLE: 'Comprar pase',
        DESCRIPTION: (name) => `Configura el pago de ${name}.`,
        METHOD: 'Método de pago',
        REFERENCE: 'Referencia (opcional)',
        REFERENCE_PLACEHOLDER: 'Ej: 12345678',
        REFERENCE_HINT:
          'Si tu banco o billetera te dio una referencia, colócala aquí.',
        SUBMIT: 'Confirmar compra',
        PROCESSING: 'Registrando compra…',
        SUCCESS:
          'Compra registrada. Tu pase se activará cuando el pago sea validado.',
        ERROR: 'No se pudo registrar la compra. Intenta nuevamente.',
        TOTAL: 'Total a pagar',
        SECURE_NOTE: 'Tus datos de pago no se almacenan en Caimanera.',
      },
    },
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
      DESCRIPTION: 'Administra los planes de suscripción de Caimanera.',
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
