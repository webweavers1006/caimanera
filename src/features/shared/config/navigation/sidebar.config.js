/**
 * SIDEBAR CONFIG — UI labels + nav structure with icons & permissions.
 * Imports ROUTES from routes.config.js to build the navigation tree.
 */

import {
  Users,
  Settings,
  UserLock,
  ShieldCheck,
  LayoutDashboard,
  FolderTree,
  Globe,
  ClipboardList,
  Activity,
  Ban,
  Warehouse,
  Trophy,
  CreditCard,
  UserPlus,
} from "lucide-react"
import { ROUTES } from "./routes.config"

export const SIDEBAR_CONFIG = {
  UI: {
    LABELS: {
      GROUP_TITLE: "Plataforma",
      THEME_MODE: "Modo de Luz",
      THEME_SYSTEM: "Sistema",
      THEME_LIGHT: "Claro",
      THEME_DARK: "Oscuro",
      PERF_MODE: "Rendimiento",
      PERF_AUTO: "Automático",
      PERF_LOW: "Bajo (sin efectos)",
      PROFILE: "Perfil",
      LOGOUT: "Cerrar Sesión",
    },
  },
  NAV: {
    items: [
      {
        title: "Dashboard",
        url: ROUTES.DASHBOARD.path,
        icon: LayoutDashboard,
      },
      {
        title: "Deporte",
        url: ROUTES.PLAYMATCH.MATCHES.path,
        icon: Trophy,
        items: [
          { title: ROUTES.PLAYMATCH.COURTS.title, url: ROUTES.PLAYMATCH.COURTS.path, permission: ROUTES.PLAYMATCH.COURTS.permission, icon: Warehouse },
          { title: ROUTES.PLAYMATCH.MATCHES.title, url: ROUTES.PLAYMATCH.MATCHES.path, permission: ROUTES.PLAYMATCH.MATCHES.permission, icon: Trophy },
          { title: ROUTES.PLAYMATCH.SUBSCRIPTIONS.title, url: ROUTES.PLAYMATCH.SUBSCRIPTIONS.path, permission: ROUTES.PLAYMATCH.SUBSCRIPTIONS.permission, icon: CreditCard },
          { title: ROUTES.PLAYMATCH.PARTICIPANTS.title, url: ROUTES.PLAYMATCH.PARTICIPANTS.path, permission: ROUTES.PLAYMATCH.PARTICIPANTS.permission, icon: UserPlus },
        ],
      },
      {
        title: "Administrador",
        url: "#",
        icon: Settings,
        items: [
          { title: ROUTES.ADMIN.USERS.title, url: ROUTES.ADMIN.USERS.path, permission: ROUTES.ADMIN.USERS.permission, icon: Users },
          { title: ROUTES.AUDIT.title, url: ROUTES.AUDIT.path, permission: ROUTES.AUDIT.permission, icon: ClipboardList },
          { title: ROUTES.ADMIN.SSE_MONITOR.title, url: ROUTES.ADMIN.SSE_MONITOR.path, permission: ROUTES.ADMIN.SSE_MONITOR.permission, icon: Activity },
          { title: ROUTES.ADMIN.LOGIN_LOCKS.title, url: ROUTES.ADMIN.LOGIN_LOCKS.path, permission: ROUTES.ADMIN.LOGIN_LOCKS.permission, icon: Ban },
        ],
      },
      {
        title: "Control de Acceso",
        url: "#",
        icon: ShieldCheck,
        items: [
          { title: ROUTES.ADMIN.ROLES.title, url: ROUTES.ADMIN.ROLES.path, permission: ROUTES.ADMIN.ROLES.permission, icon: UserLock },
          { title: ROUTES.ADMIN.PERMISSIONS.title, url: ROUTES.ADMIN.PERMISSIONS.path, permission: ROUTES.ADMIN.PERMISSIONS.permission, icon: ShieldCheck },
        ],
      },
      {
        title: "Catálogos",
        url: "#",
        icon: FolderTree,
        items: [
          { title: ROUTES.CATALOGS.COUNTRIES.title, url: ROUTES.CATALOGS.COUNTRIES.path, permission: ROUTES.CATALOGS.COUNTRIES.permission, icon: Globe },
        ],
      },
    ],
  },
}
