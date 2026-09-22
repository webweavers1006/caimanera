import { logger } from "@/features/shared";
import { permissionReadRepository, getPermissionsPaginated } from "../repositories/permission.read.repository";
import { PERMISSION_CONFIG } from "../config/permission.constants";

/**
 * Retrieves all available system permissions from the database.
 * @returns {Promise<Array>} List of system permissions.
 */
export const getAllSystemPermissions = async () => {
  try {
    return await permissionReadRepository.findAll();
  } catch (error) {
    logger.error("Error fetching system permissions:", error);
    throw error;
  }
};

/**
 * Fetches paginated permissions list with search and sorting.
 * @param {Object} options
 * @returns {Promise<{items: Array, totalCount: number, page: number, pageSize: number, totalPages: number}>}
 */
export async function fetchPermissionsList({ page, pageSize, searchTerm, sortKey, sortDirection } = {}) {
  try {
    const safePageSize = Number(pageSize) || PERMISSION_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
    const safePage = Number(page) || 1;
    const safeSearchTerm = searchTerm?.trim() || "";

    const result = await getPermissionsPaginated({
      page: safePage,
      pageSize: safePageSize,
      searchTerm: safeSearchTerm,
      sortKey,
      sortDirection,
    });

    return {
      items: result.permissions,
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  } catch (error) {
    logger.error("Failed to fetch permissions list", { error: error.message });
    return { items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 1 };
  }
}

/**
 * Fetches a single permission by ID with role count.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function fetchPermissionById(id) {
  try {
    return await permissionReadRepository.findByIdWithRoleCount(Number(id));
  } catch (error) {
    logger.error("Error fetching permission by id", { error: error.message, permissionId: id });
    return null;
  }
}
