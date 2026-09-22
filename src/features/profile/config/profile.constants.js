/**
 * Centralized configuration for the Profile (self-service account) module.
 */

export const PROFILE_CONFIG = {
  // Module route — accessed from the user dropdown (not the sidebar nav)
  PATH: "/admin/perfil",
  TITLE: "Mi Perfil",

  UI: {
    LABELS: {
      TITLE: "Mi Perfil",
      DESCRIPTION: "Gestiona tu información de cuenta y cambia tu contraseña.",
      ACCOUNT_TITLE: "Información de la Cuenta",
      NAME: "Nombre",
      EMAIL: "Correo Electrónico",
      ROLE: "Rol",
      CHANGE_PASSWORD_TITLE: "Cambiar Contraseña",
      CHANGE_PASSWORD_DESCRIPTION:
        "Ingresa tu contraseña actual para confirmar tu identidad y define una nueva contraseña.",
    },
  },
};
