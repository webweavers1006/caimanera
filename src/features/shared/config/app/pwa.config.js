/**
 * PWA configuration: install/offline copy and the colors that must stay in sync
 * between the manifest, the document `theme-color` and the offline fallback.
 */
export const PWA_CONFIG = {
  /** Matches `--background` of the dark theme in `globals.css`. */
  themeColor: "#0d0e19",
  UI: {
    INSTALL_TITLE: "Lleva Caimanera en tu teléfono",
    INSTALL_DESCRIPTION:
      "Instálala para abrirla como una app, sin barra del navegador.",
    INSTALL_ACTION: "Instalar app",
    INSTALL_ACTION_IOS: "Añadir a inicio",
    INSTALL_IOS_HINT:
      "En Safari toca Compartir y luego “Añadir a pantalla de inicio”.",
    INSTALL_FIREFOX_TITLE: "Para instalarla, abre Caimanera en Chrome",
    INSTALL_FIREFOX_DESCRIPTION:
      "Firefox en Android solo crea un acceso directo y abre la app dentro del navegador. Abre esta misma dirección en Chrome y elige “Instalar app” (o “Añadir a pantalla de inicio”).",
    OFFLINE: "Sin conexión. Algunas funciones no están disponibles.",
    OFFLINE_TITLE: "Sin conexión",
    OFFLINE_DESCRIPTION: (appName) =>
      `No pudimos cargar ${appName}. Revisa tu conexión a internet e inténtalo de nuevo.`,
    OFFLINE_ACTION: "Reintentar",
  },
};
