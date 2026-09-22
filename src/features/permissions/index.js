// ⚠️ Barrel seguro: solo config, constantes y datos.
// getSession, prisma, createProtectedAction, checkPageAccess
// se importan por ruta directa (usan server-only).
export { PERMISSION_CONFIG } from './config/permission.constants'
export { getPermissionTableColumns } from './config/permission.columns'
