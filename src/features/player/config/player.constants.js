/**
 * Player surface copy. `mis-partidos` is the player's private agenda, split
 * into upcoming matches and the history of matches already played.
 */
export const PLAYER_CONFIG = {
  ACCOUNT: {
    EYEBROW: "Tu cuenta",
    TITLE: "Mi cuenta",
    SUBTITLE: "Tu pase, tus pagos y los datos de tu cuenta.",
    GREETING: (name) => `Hola, ${name || "jugador"} 👋`,
    PASS_TITLE: "Mi pase",
    PASS_ACTIVE: (name, credits) => `${name} · ${credits} créditos`,
    PASS_MULTIPLE: (count, credits) =>
      `${count} pases activos · ${credits} créditos`,
    PASS_EMPTY: "Sin pase activo",
    PASS_DESCRIPTION: "Consulta, compra o renueva tu pase.",
    PAYMENTS_TITLE: "Mis pagos",
    PAYMENTS_DESCRIPTION: "Historial de pagos de partidos y pases.",
    OPEN: "Abrir",
    PROFILE_TITLE: "Mis datos",
    PROFILE_DESCRIPTION: "Información de la cuenta y cambio de contraseña.",
  },
  MY_MATCHES: {
    EYEBROW: "Tu agenda",
    TITLE: "Mis partidos",
    SUBTITLE: "Tus próximos partidos y el historial de los que ya jugaste.",
    HINT: "Toca un partido para ver el detalle o cancelar tu inscripción.",
    HISTORY_HINT: "Toca un partido para ver la información completa.",
    COUNT: (n) => `${n} ${n === 1 ? "partido" : "partidos"}`,
    TABS: {
      UPCOMING: "Próximos",
      HISTORY: "Historial",
    },
    EMPTY_TITLE: "Todavía no tienes partidos",
    EMPTY_DESCRIPTION:
      "Cuando te inscribas en un partido, aparecerá aquí para que no pierdas el hilo.",
    EMPTY_ACTION: "Buscar partido",
    HISTORY_EMPTY_TITLE: "Todavía no hay historial",
    HISTORY_EMPTY_DESCRIPTION:
      "Cuando juegues tu primer partido, aparecerá aquí con su resultado.",
    HISTORY_EMPTY_ACTION: "Buscar partido",
    HISTORY_COUNT: (n) => `${n} ${n === 1 ? "partido jugado" : "partidos jugados"}`,
    STATUS_CONFIRMED: "Tu cupo está confirmado",
    STATUS_WAITLIST: "Estás en lista de espera",
  },
};
