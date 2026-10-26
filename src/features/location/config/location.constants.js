/**
 * Location module configuration: persisted keys, curated fallback zones and
 * the copy used by the location button and the picker dialog.
 */
export const LOCATION_CONFIG = {
  STORAGE: {
    LOCATION: "caimanera:location",
    RECENTS: "caimanera:recent-locations",
  },

  MAX_RECENTS: 5,

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
    BUTTON_LABEL: "Tu ubicación",
    BUTTON_NEAR: "Buscando cerca de",
    BUTTON_PLACEHOLDER: "Elige dónde quieres jugar",
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
};
