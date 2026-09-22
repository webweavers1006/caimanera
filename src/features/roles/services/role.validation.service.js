import { getRoleByName, getRoleByIdWithUserCount } from "../repositories/role.read.repository";

/**
 * Valida la unicidad del nombre del rol.
 * 
 * @param {string} name - Nombre del rol
 * @param {string|number} [currentId] - ID del rol actual (para actualizaciones)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function validateRoleName(name, currentId = null) {
  const existing = await getRoleByName(name, currentId ? parseInt(currentId) : null);

  if (existing) {
    return { success: false, error: "Ya existe un rol con ese nombre." };
  }

  return { success: true };
}

/**
 * Valida si un rol puede ser eliminado.
 * 
 * @param {string|number} id - ID del rol
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function validateRoleDeletion(id) {
  const role = await getRoleByIdWithUserCount(parseInt(id));

  if (!role) {
    return { success: false, error: "El rol no existe." };
  }

  if (role.usersCount > 0) {
    return { 
      success: false, 
      error: `No se puede eliminar: Hay ${role.usersCount} usuarios asignados a este rol.` 
    };
  }

  return { success: true };
}
