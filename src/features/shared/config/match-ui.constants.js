/**
 * Copy shared by every surface that shows a public match: the card used in
 * home/search/venues, the map and the checkout drawer.
 *
 * Feature-specific copy (search filters, venue listing, home, player agenda)
 * lives with its own feature.
 */
export const MATCH_UI = {
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

  MAP: {
    LOADING: "Cargando mapa…",
    LEGEND: "Partidos disponibles",
    YOUR_LOCATION: "Tu ubicación",
    UNAVAILABLE: "El mapa no está disponible en este momento.",
  },
};
