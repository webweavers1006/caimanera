// ⚠️ Barrel seguro: solo config, constantes y datos.
// getAllRoles, getRoleByName, fetchRolesList
// se importan por ruta directa (usan prisma → server-only).
export { ROLE_CONFIG } from './config/role.constants'
export { roleColumns } from './config/role.columns'
