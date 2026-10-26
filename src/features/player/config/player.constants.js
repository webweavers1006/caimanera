/**
 * Player surface copy. `mis-partidos` is the player's private agenda.
 */
export const PLAYER_CONFIG = {
  MY_MATCHES: {
    EYEBROW: "Tu agenda",
    TITLE: "Mis partidos",
    SUBTITLE: "Tus próximos partidos, ordenados por fecha.",
    HINT: "Toca un partido para ver el detalle o cancelar tu inscripción.",
    COUNT: (n) => `${n} ${n === 1 ? "partido" : "partidos"}`,
    EMPTY_TITLE: "Todavía no tienes partidos",
    EMPTY_DESCRIPTION:
      "Cuando te inscribas en un partido, aparecerá aquí para que no pierdas el hilo.",
    EMPTY_ACTION: "Buscar partido",
    STATUS_CONFIRMED: "Tu cupo está confirmado",
    STATUS_WAITLIST: "Estás en lista de espera",
  },
};
