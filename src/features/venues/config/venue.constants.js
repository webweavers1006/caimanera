/**
 * Venue listing and venue detail copy (`/canchas` and `/canchas/[id]`).
 */
export const VENUE_CONFIG = {
  UI: {
    LIST: {
      EYEBROW: "Canchas",
      TITLE: "Canchas y clubes",
      SUBTITLE: "Encuentra dónde jugar cerca de ti.",
      COUNT: (n) => `${n} ${n === 1 ? "cancha" : "canchas"}`,
      EMPTY_TITLE: "Todavía no hay canchas disponibles",
      EMPTY_DESCRIPTION: "Vuelve pronto o explora los partidos disponibles.",
      EMPTY_ACTION: "Ver partidos",
      BACK: "Volver a canchas",
      DETAIL_MATCHES_TITLE: "Próximos partidos",
      DETAIL_MATCHES_SUBTITLE: "Asegura tu cupo en esta cancha.",
      NO_MATCHES_TITLE: "Sin partidos próximos",
      NO_MATCHES_DESCRIPTION:
        "Esta cancha no tiene partidos programados por ahora. Explora los demás partidos disponibles.",
      NO_MATCHES_ACTION: "Ver otros partidos",
      SEE_MATCHES: "Ver todos los partidos de esta cancha",
    },
    DETAIL: {
      MATCHES: (n) => `${n} ${n === 1 ? "partido próximo" : "partidos próximos"}`,
      NO_MATCHES: "Sin partidos próximos",
      VIEW: "Ver cancha",
    },
  },

  SECTIONS: {
    TITLE: "Canchas cerca de ti",
    SUBTITLE: "Los escenarios donde se juega la comunidad.",
  },
};
