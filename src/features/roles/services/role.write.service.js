import { 
  createRole as createRepo, 
  updateRole as updateRepo, 
  deleteRole as deleteRepo 
} from "../repositories/role.write.repository";
import { validateRoleName, validateRoleDeletion } from "./role.validation.service";
import { logger } from "@/features/shared";
import { ROLE_CONFIG } from "../config/role.constants";

const { MESSAGES } = ROLE_CONFIG.UI.LABELS;

/**
 * Creates a new role with permissions.
 */
export async function createRole(data) {
  try {
    const validation = await validateRoleName(data.name);
    if (!validation.success) return validation;

    const newRole = await createRepo(data);
    return { success: true, data: newRole, message: MESSAGES.SUCCESS.CREATE };
  } catch (error) {
    logger.error("Error creating role", { error: error.message });
    return { success: false, error: MESSAGES.ERROR.CREATE };
  }
}

/**
 * Updates an existing role.
 */
export async function updateRole(id, data) {
  const roleId = parseInt(id);

  try {
    const validation = await validateRoleName(data.name, roleId);
    if (!validation.success) return validation;

    const updatedRole = await updateRepo(roleId, data);
    return { success: true, data: updatedRole, message: MESSAGES.SUCCESS.UPDATE };
  } catch (error) {
    logger.error("Error updating role", { error: error.message, roleId });
    return { success: false, error: MESSAGES.ERROR.UPDATE };
  }
}

/**
 * Soft-deletes a role if it has no assigned users.
 */
export async function deleteRole(id) {
  const roleId = parseInt(id);

  try {
    const validation = await validateRoleDeletion(roleId);
    if (!validation.success) return validation;

    await deleteRepo(roleId);
    return { success: true, message: MESSAGES.SUCCESS.DELETE };
  } catch (error) {
    logger.error("Error deleting role", { error: error.message, roleId });
    return { success: false, error: MESSAGES.ERROR.DELETE };
  }
}
