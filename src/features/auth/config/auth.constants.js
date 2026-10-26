/**
 * Centralized configuration for the Authentication module.
 */

export const AUTH_CONFIG = {
  // Module routes
  PATH: {
    LOGIN: '/login',
    DASHBOARD: '/admin',
    DISCOVERY: '/',
    LOGIN_LOCKS: '/admin/bloqueos-login',
  },

  // Security permissions
  PERMISSIONS: {
    LOGIN_UNLOCK: 'auth:unlock', // Unlock IPs blocked by the login rate limiter
  },

  // Default roles
  ROLES: {
    ADMIN: 'ADMIN',
    USER: 'USER',
  },

  // Cookies and Session
  SESSION: {
    // Cookie name with __Host- prefix in production (Secure) for cookie tossing protection.
    // Falls back to 'session' in dev without HTTPS. See auth.js for runtime resolution.
    COOKIE_NAME: '__Host-session',
    EXPIRES_IN_MS: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    EXPIRES_IN_STR: '8h', // Expiration string for jose signJWT
  },

  // Rate Limiting
  RATE_LIMIT: {
    MAX_ATTEMPTS: 5,                      // max attempts per window
    WINDOW_MS: 15 * 60 * 1000,            // 15 minutes in milliseconds
    HEADERS: {
      CLIENT_IP: 'x-forwarded-for',       // client IP header (proxy/CDN)
      REAL_IP: 'x-real-ip',               // alternative real IP header
    },
  },

  // Self-service password change (any authenticated user)
  PASSWORD_CHANGE: {
    MESSAGES: {
      SUCCESS: 'Contraseña actualizada correctamente.',
    },
    ERRORS: {
      GENERIC: 'No se pudo cambiar la contraseña. Intenta nuevamente.',
      CURRENT_INCORRECT: 'La contraseña actual no es correcta.',
    },
    UI: {
      LABELS: {
        CURRENT_PASSWORD: 'Contraseña actual',
        CURRENT_PLACEHOLDER: '••••••',
        CURRENT_DESCRIPTION: 'Por seguridad, ingresa tu contraseña actual.',
        NEW_PASSWORD: 'Nueva contraseña',
        NEW_PLACEHOLDER: 'Mínimo 6 caracteres',
        CONFIRM_PASSWORD: 'Confirmar nueva contraseña',
        CONFIRM_PLACEHOLDER: 'Repite la nueva contraseña',
        SUBMIT: 'Actualizar Contraseña',
        SAVING: 'Actualizando...',
      },
    },
  },

  // Error messages
  ERRORS: {
    INVALID_CREDENTIALS: 'Credenciales incorrectas',
    SERVER_ERROR: 'Error del servidor al autenticar',
    UNAUTHORIZED: 'Usuario no autenticado',
    FORBIDDEN: 'No tienes permiso para realizar esta acción',
    RATE_LIMITED: 'Demasiados intentos. Intenta de nuevo en unos minutos.',
  },
  UI: {
    LABELS: {
      WELCOME_MESSAGE: 'Bienvenido a Caimanera',
      HEADER: {
        SUBTITLE: 'PLATAFORMA HIPERLOCAL DE CONEXIÓN DEPORTIVA',
      },
      CARD: {
        TITLE: 'Bienvenido de nuevo',
        DESCRIPTION: 'Inicia sesión para reservar tu cupo y seguir jugando.',
      },
      FORM: {
        EMAIL: 'Correo electrónico',
        EMAIL_PLACEHOLDER: 'tucorreo@ejemplo.com',
        PASSWORD: 'Contraseña',
        PASSWORD_PLACEHOLDER: 'Tu contraseña',
        SUBMIT: 'Iniciar sesión',
        SUBMITTING: 'Ingresando...',
        SHOW_PASSWORD: 'Mostrar contraseña',
        HIDE_PASSWORD: 'Ocultar contraseña',
      },
      FOOTER: {
        TERMS_TEXT: 'Al continuar, aceptas los',
        TERMS_LINK: 'Términos de Servicio',
        PRIVACY_LINK: 'Política de Privacidad',
      }
    }
  },

  // Login locks admin panel (rate-limit unlock)
  LOGIN_LOCKS: {
    TITLE: 'Bloqueos de Login',
    DESCRIPTION: 'IPs bloqueadas temporalmente por exceder el límite de intentos de inicio de sesión.',
    UI: {
      LABELS: {
        BLOCKED_IPS: 'IPs bloqueadas',
        MAX_ATTEMPTS: 'Máximo de intentos',
        WINDOW_MINUTES: 'Ventana (minutos)',
        EMPTY: 'No hay IPs bloqueadas actualmente',
        TABLE_IP: 'Dirección IP',
        TABLE_ATTEMPTS: 'Intentos',
        TABLE_RESETS_AT: 'Se desbloquea a las',
        TABLE_ACTIONS: 'Acciones',
        UNLOCK: 'Desbloquear',
        UNLOCK_SUCCESS: 'IP desbloqueada correctamente',
        UNLOCK_ERROR: 'No se pudo desbloquear la IP',
        ERROR: 'Error al cargar los bloqueos de login',
        NOTE: 'Los contadores viven en memoria de la instancia actual del servidor y se reinician automáticamente al expirar la ventana.',
      },
    },
  },
};

/** Roles that land in the management panel after login. */
const MANAGEMENT_ROLES = new Set(['ADMIN', 'COURT_MANAGER']);

/**
 * Whether a role belongs to the administrative panel.
 *
 * @param {string} roleName
 * @returns {boolean}
 */
export function isManagementRole(roleName) {
  return MANAGEMENT_ROLES.has(roleName);
}

/**
 * Resolves the post-login/home path for a role.
 * Players go to the app home; staff go to the admin panel.
 *
 * @param {string} roleName
 * @returns {string}
 */
export function getHomePathForRole(roleName) {
  return isManagementRole(roleName)
    ? AUTH_CONFIG.PATH.DASHBOARD
    : AUTH_CONFIG.PATH.DISCOVERY;
}
