import { getPermissionBySlug, getPermissionByIdWithRoleCount } from "../repositories/permission.read.repository";

/**
 * Validates slug uniqueness.
 * @param {string} slug — Permission slug.
 * @param {number} [currentId] — Current permission ID (excluded for updates).
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function validatePermissionSlug(slug, currentId = null) {
  const existing = await getPermissionBySlug(slug, currentId ? Number(currentId) : null);

  if (existing) {
    return { success: false, error: "Ya existe un permiso con ese slug." };
  }

  return { success: true };
}

/**
 * Validates if a permission can be deleted.
 * Checks if it has roles assigned.
 * @param {number} id — Permission ID.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function validatePermissionDeletion(id) {
  const permission = await getPermissionByIdWithRoleCount(Number(id));

  if (!permission) {
    return { success: false, error: "El permiso no existe." };
  }

  if (permission.rolesCount > 0) {
    return {
      success: false,
      error: `No se puede eliminar: Hay ${permission.rolesCount} roles que usan este permiso.`,
    };
  }

  return { success: true };
}
