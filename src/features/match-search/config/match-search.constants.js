/**
 * Match search configuration: filter values and copy for `/partidos`.
 * Filters are serialized in the URL, so these values are part of the public
 * contract of the page.
 */
export const MATCH_SEARCH_CONFIG = {
  RADIUS: {
    DEFAULT: 10,
    OPTIONS: [
      { value: 1, label: "1 km" },
      { value: 3, label: "3 km" },
      { value: 5, label: "5 km" },
      { value: 10, label: "10 km" },
      { value: 25, label: "25 km" },
      { value: "all", label: "Todo" },
    ],
  },

  DATE_FILTERS: [
    { value: "all", label: "Cualquier día" },
    { value: "today", label: "Hoy" },
    { value: "tomorrow", label: "Mañana" },
    { value: "week", label: "Esta semana" },
  ],

  SORT: {
    DEFAULT: "distance",
    OPTIONS: [
      { value: "distance", label: "Más cerca" },
      { value: "date", label: "Próximos" },
      { value: "price", label: "Mejor precio" },
      { value: "slots", label: "Más cupos" },
    ],
  },

  VIEW: {
    LIST: "list",
    MAP: "map",
  },

  UI: {
    STAGE: {
      EYEBROW: "Partidos",
      TITLE: "Elige tu partido",
      SUBTITLE: "Compara horarios y asegura tu cupo.",
      BACK: "Volver al inicio",
      OPEN_FILTERS: "Abrir filtros",
      VIEW: "Vista de resultados",
      CLEAR: "Limpiar",
    },
    SECTIONS: {
      MATCHES_TITLE: "Partidos cerca de ti",
      MATCHES_TITLE_ALL: "Próximos partidos",
      MATCHES_SUBTITLE: (count) =>
        `${count} ${count === 1 ? "partido disponible" : "partidos disponibles"}`,
    },
    FILTERS: {
      SPORTS: "Deporte",
      ALL_SPORTS: "Todos",
      DATE: "Día",
      RADIUS: "Distancia",
      SORT: "Ordenar por",
      SEARCH: "Buscar",
      CLEAR: "Limpiar filtros",
      VIEW_LIST: "Lista",
      VIEW_MAP: "Mapa",
      RESULTS: "Resultados",
      RADIUS_HINT: "A la redonda de tu ubicación",
    },
    EMPTY: {
      TITLE: "Todavía no hay partidos por aquí",
      DESCRIPTION:
        "Prueba ampliar la distancia o cambiar el día. También puedes explorar todos los partidos disponibles.",
      ACTION: "Ver todos los partidos",
      SEARCH_TITLE: "No encontramos partidos con esos filtros",
      SEARCH_DESCRIPTION: "Prueba con otro deporte, otro día o limpia los filtros.",
      SEARCH_ACTION: "Limpiar filtros",
    },
  },
};
