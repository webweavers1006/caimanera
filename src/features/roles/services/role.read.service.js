import {
  getRolesPaginated,
  getAllRoles,
  getRoleByName,
  getRoleByIdWithPermissions
} from "../repositories/role.read.repository";
import { ROLE_CONFIG } from "../config/role.constants";
import { logger } from "@/features/shared";

/**
 * Fetches paginated roles list (no cross-feature imports).
 * Permissions are fetched independently by the caller (RolePageContainer).
 */
export async function fetchRolesList({ page, pageSize, searchTerm, sortKey, sortDirection } = {}) {
  try {
    const safePageSize = Number(pageSize) || ROLE_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
    const safePage = Number(page) || 1;
    const safeSearchTerm = searchTerm?.trim() || "";

    const rolesResult = await getRolesPaginated({
      page: safePage,
      pageSize: safePageSize,
      searchTerm: safeSearchTerm,
      sortKey,
      sortDirection,
    });

    return {
      items: rolesResult.roles,
      totalCount: rolesResult.totalCount,
      page: rolesResult.page,
      pageSize: rolesResult.pageSize,
      totalPages: rolesResult.totalPages,
    };
  } catch (error) {
    logger.error("Failed to fetch roles list", { error: error.message });
    return { items: [], totalCount: 0, page: 1, totalPages: 1 };
  }
}

/**
 * Obtiene un rol por ID con sus permisos.
 */
export async function fetchRoleById(id) {
  try {
    return await getRoleByIdWithPermissions(parseInt(id));
  } catch (error) {
    logger.error("Error fetching role by id", { error: error.message, roleId: id });
    return null;
  }
}

/**
 * Obtiene todos los roles básicos sin paginación.
 */
export async function fetchAllRolesList() {
  try {
    return await getAllRoles();
  } catch (error) {
    logger.error("Error fetching all roles", { error: error.message });
    return [];
  }
}

/**
 * Busca un rol por su nombre exacto.
 * @param {string} name - Nombre del rol a buscar.
 * @param {number} [excludeId] - ID a excluir de la búsqueda (para validación de unicidad en updates).
 * @returns {Promise<Object|null>} Rol encontrado o null.
 */
export async function fetchRoleByName(name, excludeId = null) {
  try {
    return await getRoleByName(name, excludeId);
  } catch (error) {
    logger.error("Error fetching role by name", { error: error.message, roleName: name });
    return null;
  }
}
