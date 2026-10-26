/**
 * App shell configuration — navigation and chrome shared by the player-facing app.
 * This surface never renders administrative navigation.
 */

export const APP_SHELL_CONFIG = {
  UI: {
    NAV: {
      HOME: "Inicio",
      MATCHES: "Partidos",
      COURTS: "Canchas",
      MY_MATCHES: "Mis partidos",
      ACCOUNT: "Mi cuenta",
      LOGIN: "Ingresar",
      DASHBOARD: "Ir al panel",
      EXPLORE: "Explorar",
      LOGOUT: "Cerrar sesión",
      BACK_HOME: "Volver al inicio",
    },
    FOOTER: {
      TAGLINE: "Caimanera — conexión deportiva hiperlocal.",
      EXPLORE: "Explorar",
      ACCOUNT: "Cuenta",
      LEGAL: "Legal",
      TERMS: "Términos de servicio",
      PRIVACY: "Política de privacidad",
      RIGHTS: (year) => `© ${year} Caimanera. Hecho para jugar.`,
    },
  },
};
