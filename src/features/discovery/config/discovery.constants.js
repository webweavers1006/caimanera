/**
 * Discovery experience configuration (consumer-facing home + public match pages).
 * All copy lives here to keep components config-driven.
 */

export const DISCOVERY_CONFIG = {
  PATHS: {
    HOME: "/",
    MATCHES: "/partidos",
    VENUES: "/canchas",
    MY_MATCHES: "/mis-partidos",
    ACCOUNT: "/cuenta",
  },

  STORAGE: {
    LOCATION: "caimanera:location",
    RECENTS: "caimanera:recent-locations",
    RADIUS: "caimanera:radius",
  },

  MAX_RECENTS: 5,
  MAX_DISCOVERY_MATCHES: 200,

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

  /**
   * Curated zones used as a fast, offline-friendly fallback when the
   * address geocoder is unavailable. Coordinates are approximate centers.
   */
  ZONES: [
    { label: "Caracas, Distrito Capital", latitude: 10.4806, longitude: -66.9036 },
    { label: "Chacao, Miranda", latitude: 10.4961, longitude: -66.8537 },
    { label: "El Hatillo, Miranda", latitude: 10.4249, longitude: -66.8259 },
    { label: "Baruta, Miranda", latitude: 10.4337, longitude: -66.8769 },
    { label: "Petare, Miranda", latitude: 10.4779, longitude: -66.8079 },
    { label: "La Guaira, La Guaira", latitude: 10.6014, longitude: -66.9326 },
    { label: "Los Teques, Miranda", latitude: 10.3446, longitude: -67.0433 },
    { label: "Guarenas, Miranda", latitude: 10.4703, longitude: -66.5365 },
    { label: "Valencia, Carabobo", latitude: 10.1620, longitude: -68.0077 },
    { label: "Maracay, Aragua", latitude: 10.2470, longitude: -67.5958 },
    { label: "Barquisimeto, Lara", latitude: 10.0739, longitude: -69.3228 },
    { label: "Maracaibo, Zulia", latitude: 10.6540, longitude: -71.6124 },
    { label: "Puerto La Cruz, Anzoátegui", latitude: 10.2140, longitude: -64.6320 },
    { label: "Mérida, Mérida", latitude: 8.5897, longitude: -71.1561 },
  ],

  UI: {
    HOME: {
      GREETING: (name) => `Hola, ${name || "jugador"} 👋`,
      TITLE: "¿Dónde jugamos hoy?",
      SUBTITLE: "Encuentra tu próximo partido y las canchas cerca de ti.",
      LOCATION_LABEL: "Tu ubicación",
      LOCATION_NEAR: "Buscando cerca de",
      LOCATION_PLACEHOLDER: "Elige dónde quieres jugar",
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
    LOCATION: {
      LOCATE: "Usar mi ubicación",
      LOCATING: "Ubicando…",
      POPULAR: "Zonas populares",
      RECENTS: "Ubicaciones recientes",
      VENUES: "Canchas y clubes",
      ADDRESS_SEARCH: "Buscar una dirección",
      ADDRESS_PLACEHOLDER: "Ej: Chacao, Caracas",
      ADDRESS_EMPTY: "Escribe al menos 3 caracteres.",
      ADDRESS_NO_RESULTS: "No encontramos esa dirección. Prueba con una zona cercana.",
      ADDRESS_ERROR: "No se pudo buscar la dirección. Intenta de nuevo.",
      DIALOG_TITLE: "¿Dónde vas a jugar?",
      DIALOG_DESCRIPTION:
        "Selecciona tu ubicación para ordenar los partidos por cercanía.",
    },
    SECTIONS: {
      MATCHES_TITLE: "Partidos cerca de ti",
      MATCHES_TITLE_ALL: "Próximos partidos",
      MATCHES_SUBTITLE: (count) =>
        `${count} ${count === 1 ? "partido disponible" : "partidos disponibles"}`,
      VENUES_TITLE: "Canchas cerca de ti",
      VENUES_SUBTITLE: "Los escenarios donde se juega la comunidad.",
    },
    VENUES: {
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
    MATCHES_STAGE: {
      EYEBROW: "Partidos",
      TITLE: "Elige tu partido",
      SUBTITLE: "Compara horarios y asegura tu cupo.",
      BACK: "Volver al inicio",
      OPEN_FILTERS: "Abrir filtros",
      VIEW: "Vista de resultados",
      CLEAR: "Limpiar",
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
    CARD: {
      JOIN: "Inscribirme",
      JOIN_WAITLIST: "Unirme a la lista",
      JOINED: "Ya estás inscrito",
      WAITLISTED: "En lista de espera",
      LOGIN: "Iniciar sesión para unirte",
      FULL: "Lleno",
      NO_SLOTS: "Sin cupos",
      SLOTS_LEFT: (n) =>
        n === 0 ? "Sin cupos disponibles" : `${n} ${n === 1 ? "cupo libre" : "cupos libres"}`,
      SLOTS: (n) => `${n} ${n === 1 ? "cupo" : "cupos"}`,
      CONFIRMED: (n) => `${n} confirmados`,
      PRICE: "por jugador",
      DISTANCE: (value) => `a ${value}`,
      MINUTES: (n) => `~${n} min`,
      VIEW: "Ver partido",
      VIEW_FULL: "Ver información completa",
      CANCEL: "Cancelar inscripción",
      CANCEL_TITLE: "¿Cancelar tu inscripción?",
      CANCEL_DESCRIPTION:
        "Tu cupo volverá a estar disponible y, si hay alguien en lista de espera, subirá automáticamente.",
      KEEP: "Mantener inscripción",
      CONFIRM_CANCEL: "Sí, cancelar",
      CANCEL_SUCCESS: "Inscripción cancelada.",
      LEAVE_WAITLIST: "Salir de la lista",
      PAID_WITH_PASS: "Cubierto por tu pase",
      PASS_HINT: (n) =>
        `Te quedan ${n} ${n === 1 ? "partido" : "partidos"} en tu pase`,
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
    VENUE: {
      MATCHES: (n) => `${n} ${n === 1 ? "partido próximo" : "partidos próximos"}`,
      NO_MATCHES: "Sin partidos próximos",
      VIEW: "Ver cancha",
    },
    MAP: {
      LOADING: "Cargando mapa…",
      LEGEND: "Partidos disponibles",
      YOUR_LOCATION: "Tu ubicación",
      UNAVAILABLE: "El mapa no está disponible en este momento.",
    },
  },
};

export function getSportEmoji(sport) {
  const value = String(sport || "").toLowerCase();
  if (value.includes("fútbol") || value.includes("futbol")) return "⚽";
  if (value.includes("pádel") || value.includes("padel")) return "🎾";
  if (value.includes("tenis")) return "🎾";
  if (value.includes("béisbol") || value.includes("beisbol")) return "⚾";
  if (value.includes("basket") || value.includes("baloncesto")) return "🏀";
  if (value.includes("volei") || value.includes("vólei")) return "🏐";
  return "🏟️";
}
