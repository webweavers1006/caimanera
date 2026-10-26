/**
 * Consumer payment configuration.
 *
 * The gateway adapter is intentionally isolated behind these method codes so
 * the checkout UI does not need to know whether a payment is processed by
 * BDT, a manual transfer or a card acquirer.
 */

export const PAYMENT_METHOD_VALUES = [
  "BDT",
  "MOBILE_PAYMENT",
  "BINANCE",
  "CARD",
  "SUBSCRIPTION_CREDIT",
  "STAFF_BYPASS",
];

export const PAYMENT_CONFIG = {
  CURRENCY: "USD",
  VES_CURRENCY: "VES",
  VES_RATE: Number(process.env.NEXT_PUBLIC_VES_RATE) || 0,

  METHODS: [
    {
      value: "BDT",
      label: "BDT",
      description: "Pasarela BDT · débito inmediato",
      icon: "landmark",
      recommended: true,
    },
    {
      value: "MOBILE_PAYMENT",
      label: "Pago móvil o transferencia",
      description: "Paga en bolívares desde tu banco",
      icon: "smartphone",
    },
    {
      value: "BINANCE",
      label: "Binance",
      description: "Paga con cripto y guarda tu referencia",
      icon: "bitcoin",
    },
    {
      value: "CARD",
      label: "Tarjeta nacional / internacional",
      description: "Débito o crédito con tu banco",
      icon: "credit-card",
    },
  ],

  UI: {
    TITLE: "Métodos de pago",
    DESCRIPTION: "Elige cómo quieres pagar tu cupo.",
    TOTAL: "Total a pagar",
    CONTINUE: "Continuar",
    PROCESSING: "Procesando…",
    PENDING_TITLE: "Reserva registrada",
    PENDING_DESCRIPTION: "Tu cupo está reservado. El pago quedó pendiente de validación.",
    CONFIRMED_TITLE: "¡Participación confirmada!",
    CONFIRMED_DESCRIPTION: "Nos vemos en la cancha.",
    PASS_TITLE: "Usar mi pase",
    PASS_DESCRIPTION: "Se descontará un partido de tu pase activo.",
    STAFF_TITLE: "Confirmar como staff",
    STAFF_DESCRIPTION: "Tu rol puede confirmar la participación sin pago.",
    REFERENCE_LABEL: "Referencia (opcional)",
    REFERENCE_PLACEHOLDER: "Ej: 12345678",
    REFERENCE_HINT: "Si tu banco o billetera te dio una referencia, colócala aquí.",
    BDT_NOTE: "Al continuar se creará la transacción y se abrirá la pasarela BDT cuando esté configurada.",
    CARD_NOTE: "Al continuar se abrirá la pasarela de tarjeta cuando esté configurada.",
    SECURE_NOTE: "Tus datos de pago no se almacenan en Caimanera.",
  },

  STATUS: {
    PENDING: "Pendiente",
    COMPLETED: "Completado",
    REFUNDED: "Reembolsado",
    FAILED: "Fallido",
  },
};

export function getPaymentMethod(value) {
  return PAYMENT_CONFIG.METHODS.find((method) => method.value === value) || null;
}
