/**
 * SSE Monitor — UI labels, permissions & page configuration.
 *
 * Read-only admin dashboard for real-time SSE connection supervision.
 * No CRUD — single-view monitoring page.
 *
 * @module sse-monitor/config/sse-monitor.constants
 */

export const SSE_MONITOR_CONFIG = {
  PATH: "/admin/sse-monitor",
  TITLE: "Monitor SSE",

  PERMISSIONS: {
    VIEW: "sse_monitor:view",
  },

  /** Anomaly detection thresholds — shared by tracker & service */
  THRESHOLDS: {
    /** Log warning when user exceeds this many connections */
    WARN: 7,
    /** Log anomaly alert when user exceeds this many connections */
    ANOMALY: 16,
  },

  /** Connection status classification */
  STATUS: {
    NORMAL: "normal",
    WARNING: "warning",
    ANOMALY: "anomaly",

    /** Tailwind text color classes per status */
    COLORS: {
      normal: "text-emerald-400",
      warning: "text-amber-400",
      anomaly: "text-red-400",
    },

    /** Tailwind background classes per status */
    BG: {
      normal: "bg-emerald-500/10",
      warning: "bg-amber-500/10",
      anomaly: "bg-red-500/10",
    },
  },

  UI: {
    LABELS: {
      DESCRIPTION:
        "Supervisión en tiempo real de conexiones SSE activas por usuario. Muestra cuántas conexiones tiene abierta cada operador en el sistema.",
      /** Cards */
      TOTAL_CONNECTIONS: "Total Conexiones",
      UNIQUE_USERS: "Usuarios Conectados",
      /** Table */
      CONNECTIONS_PER_USER: "Conexiones por Usuario",
      USER: "Usuario",
      CONNECTIONS: "Conexiones",
      STATUS: "Estado",
      /** Status badges */
      STATUS_NORMAL: "Normal",
      STATUS_WARNING: "Advertencia",
      STATUS_ANOMALY: "Anomalía",
      /** Thresholds legend */
      THRESHOLD_INFO:
        "Umbrales: 1–6 normal (múltiples pestañas) | 7–15 sospechoso | 16+ anómalo",
      /** States */
      NO_DATA: "No hay conexiones SSE activas en este momento.",
      LOADING: "Cargando estadísticas de conexiones...",
      ERROR: "No se pudieron cargar las estadísticas de conexiones SSE.",
      LAST_UPDATED: "Última actualización",
      REFRESHING: "Actualizando...",
    },
  },
};
