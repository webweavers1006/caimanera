/**
 * Centralized configuration for the administrative Payments (transactions) module.
 */

export const TRANSACTION_CONFIG = {
  PATH: "/admin/pagos",
  TITLE: "Pagos",

  PERMISSIONS: {
    VIEW: "transactions:view",
    READ: "transactions:read",
    UPDATE: "transactions:update",
  },

  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },

  UI: {
    ITEMS_PER_PAGE: 10,
    LABELS: {
      DESCRIPTION:
        "Revisa las transacciones de partidos y pases. Confirma los pagos pendientes para activar el pase o cerrar la reserva.",
      TABLE: {
        NAME: "Pago",
        USER: "Jugador",
        CONCEPT: "Concepto",
        AMOUNT: "Monto",
        METHOD: "Método",
        STATUS: "Estado",
        DATE: "Fecha",
        ACTIONS: "Acciones",
        EMPTY: "No hay pagos registrados.",
        EMPTY_SEARCH: "No se encontraron pagos con los criterios de búsqueda.",
      },
      TOOLBAR: {
        SEARCH_PLACEHOLDER: "Buscar por jugador, correo o referencia...",
        SEARCH_LABEL: "Búsqueda de pagos",
        ACTIONS_LABEL: "Acciones",
      },
      ACTIONS: {
        CONFIRM: "Confirmar",
        CONFIRMING: "Confirmando...",
        CONFIRM_SUCCESS: "Pago confirmado. El pase quedó activo.",
        CONFIRM_COMPLETED: "El pago ya estaba confirmado.",
        CONFIRM_ERROR: "No se pudo confirmar el pago.",
      },
      MESSAGES: {
        ERROR: {
          LOAD: "No se pudieron obtener los pagos.",
        },
      },
    },
  },
};
