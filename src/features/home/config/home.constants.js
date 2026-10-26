/**
 * Player home copy: greeting, quick actions, agenda summary and the venues
 * strip. The home is a routing surface, not a search surface.
 */
export const HOME_CONFIG = {
  UI: {
    GREETING: (name) => `Hola, ${name || "jugador"} 👋`,
    GUEST_GREETING: "Bienvenido a Caimanera 👋",
    TITLE: "¿Dónde jugamos hoy?",
    SUBTITLE: "Encuentra tu próximo partido y las canchas cerca de ti.",
    GUEST_CTA_TITLE: "Inicia sesión para jugar",
    GUEST_CTA_DESCRIPTION:
      "Guarda tu agenda, compra tu pase y consulta tus pagos desde tu cuenta.",
    GUEST_CTA_ACTION: "Ingresar",
    ACTIONS_TITLE: "¿Qué quieres hacer?",
    ACTIONS_SUBTITLE: "Elige cómo empezar.",
    SERVICES: {
      MATCHES: "Buscar partido",
      COURTS: "Canchas",
      MAP: "Mapa",
    },
    NEXT_MATCH_TITLE: "Tu próximo partido",
    NEXT_MATCH_SUBTITLE: "El partido más cercano en tu agenda.",
    UPCOMING_TITLE: "Mis próximos partidos",
    UPCOMING_SUBTITLE: "Todo lo que viene después.",
    VIEW_ALL: "Ver todos",
    EMPTY_TITLE: "Todavía no tienes partidos",
    EMPTY_DESCRIPTION:
      "Busca un partido cerca de ti y asegura tu cupo en segundos.",
    EMPTY_ACTION: "Buscar partido",
    VENUES_VIEW_ALL: "Ver todas las canchas",
  },

  SECTIONS: {
    VENUES_TITLE: "Canchas cerca de ti",
    VENUES_SUBTITLE: "Los escenarios donde se juega la comunidad.",
  },
};
