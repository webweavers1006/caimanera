/**
 * ROUTES CONFIG — Centralized paths, permissions & titles for Caimanera modules.
 */

import { USER_CONFIG } from "@/features/users/config/user.constants"
import { ROLE_CONFIG } from "@/features/roles/config/role.constants"
import { PERMISSION_CONFIG } from "@/features/permissions/config/permission.constants"
import { AUTH_CONFIG } from "@/features/auth/config/auth.constants"
import { AUDIT_LOG_CONFIG } from "@/features/audit-logs/config/audit-log.constants"
import { COUNTRY_CONFIG } from "@/features/countries/config/country.constants"
import { COURT_CONFIG } from "@/features/courts/config/court.constants"
import { MATCH_CONFIG } from "@/features/matches/config/match.constants"
import { SUBSCRIPTION_CONFIG } from "@/features/subscriptions/config/subscription.constants"
import { PARTICIPANT_CONFIG } from "@/features/participants/config/participant.constants"
import { SSE_MONITOR_CONFIG } from "@/features/sse-monitor/config/sse-monitor.constants"
import { PROFILE_CONFIG } from "@/features/profile/config/profile.constants"

export const ROUTES = {
  // Auth & main pages
  AUTH: {
    LOGIN: { path: AUTH_CONFIG.PATH.LOGIN },
  },
  DASHBOARD: { path: AUTH_CONFIG.PATH.DASHBOARD },
  PROFILE: { path: PROFILE_CONFIG.PATH },

  // Sports modules
  PLAYMATCH: {
    COURTS: {
      path: COURT_CONFIG.PATH,
      permission: COURT_CONFIG.PERMISSIONS.VIEW,
      title: COURT_CONFIG.TITLE,
    },
    MATCHES: {
      path: MATCH_CONFIG.PATH,
      permission: MATCH_CONFIG.PERMISSIONS.VIEW,
      title: MATCH_CONFIG.TITLE,
    },
    SUBSCRIPTIONS: {
      path: SUBSCRIPTION_CONFIG.PATH,
      permission: SUBSCRIPTION_CONFIG.PERMISSIONS.VIEW,
      title: SUBSCRIPTION_CONFIG.TITLE,
    },
    PARTICIPANTS: {
      path: PARTICIPANT_CONFIG.PATH,
      permission: PARTICIPANT_CONFIG.PERMISSIONS.VIEW,
      title: PARTICIPANT_CONFIG.TITLE,
    },
  },

  // Admin modules — user, role and permission management
  ADMIN: {
    USERS: {
      path: USER_CONFIG.PATH,
      permission: USER_CONFIG.PERMISSIONS.VIEW,
      title: USER_CONFIG.TITLE,
    },
    ROLES: {
      path: ROLE_CONFIG.PATH,
      permission: ROLE_CONFIG.PERMISSIONS.VIEW,
      title: ROLE_CONFIG.TITLE,
    },
    PERMISSIONS: {
      path: PERMISSION_CONFIG.PATH,
      permission: PERMISSION_CONFIG.PERMISSIONS.VIEW,
      title: PERMISSION_CONFIG.TITLE,
    },
    SSE_MONITOR: {
      path: SSE_MONITOR_CONFIG.PATH,
      permission: SSE_MONITOR_CONFIG.PERMISSIONS.VIEW,
      title: SSE_MONITOR_CONFIG.TITLE,
    },
    LOGIN_LOCKS: {
      path: AUTH_CONFIG.PATH.LOGIN_LOCKS,
      permission: AUTH_CONFIG.PERMISSIONS.LOGIN_UNLOCK,
      title: AUTH_CONFIG.LOGIN_LOCKS.TITLE,
    },
  },

  // Audit
  AUDIT: {
    path: AUDIT_LOG_CONFIG.PATH,
    permission: AUDIT_LOG_CONFIG.PERMISSIONS.VIEW,
    title: AUDIT_LOG_CONFIG.TITLE,
  },

  // Catalog modules — reference data
  CATALOGS: {
    COUNTRIES: {
      path: COUNTRY_CONFIG.PATH,
      permission: COUNTRY_CONFIG.PERMISSIONS.VIEW,
      title: COUNTRY_CONFIG.TITLE,
    },
  },

  // API routes — public endpoints that don't require a user session.
  // Used by proxy.js to allow display screens, health checks, etc.
  API: {
    PUBLIC: [],
  },
}
