import {
  createPermission as createRepo,
  updatePermission as updateRepo,
  deletePermission as deleteRepo,
} from "../repositories/permission.write.repository";
import { validatePermissionSlug, validatePermissionDeletion } from "./permission.validation.service";
import { logger } from "@/features/shared";
import { PERMISSION_CONFIG } from "../config/permission.constants";

const { MESSAGES } = PERMISSION_CONFIG.UI.LABELS;

/**
 * Creates a new permission with slug uniqueness validation.
 * @param {Object} data — { slug, description }
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function createPermission(data) {
  try {
    const validation = await validatePermissionSlug(data.slug);
    if (!validation.success) return validation;

    const newPermission = await createRepo(data);
    return { success: true, data: newPermission, message: MESSAGES.SUCCESS.CREATE };
  } catch (error) {
    logger.error("Error creating permission", { error: error.message });
    return { success: false, error: MESSAGES.ERROR.CREATE };
  }
}

/**
 * Updates an existing permission.
 * @param {number} id — Permission ID.
 * @param {Object} data — { slug, description }
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function updatePermission(id, data) {
  const permissionId = parseInt(id);

  try {
    const validation = await validatePermissionSlug(data.slug, permissionId);
    if (!validation.success) return validation;

    const updated = await updateRepo(permissionId, data);
    return { success: true, data: updated, message: MESSAGES.SUCCESS.UPDATE };
  } catch (error) {
    logger.error("Error updating permission", { error: error.message, permissionId });
    return { success: false, error: MESSAGES.ERROR.UPDATE };
  }
}

/**
 * Soft-deletes a permission if it has no assigned roles.
 * @param {number} id — Permission ID.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deletePermission(id) {
  const permissionId = parseInt(id);

  try {
    const validation = await validatePermissionDeletion(permissionId);
    if (!validation.success) return validation;

    await deleteRepo(permissionId);
    return { success: true, message: MESSAGES.SUCCESS.DELETE };
  } catch (error) {
    logger.error("Error deleting permission", { error: error.message, permissionId });
    return { success: false, error: MESSAGES.ERROR.DELETE };
  }
}
