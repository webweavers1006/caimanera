"use server";
import { SHARED_CONFIG } from "@/features/shared";

import { revalidatePath } from "next/cache";
import { roleSchema } from "../schemas/role.schema";
import {
  createRole as createRoleService,
  updateRole as updateRoleService,
  deleteRole as deleteRoleService,
} from "../services/role.write.service";
import { createProtectedAction, createProtectedFunction } from "@/features/shared/lib/safe-action";
import { ROUTES } from "@/features/shared";
import { ROLE_CONFIG } from "../config/role.constants";
import { logger } from "@/features/shared";

/**
 * Server Action para crear o actualizar roles.
 */
export const saveRoleAction = createProtectedAction(
  (data) => data.id ? ROLE_CONFIG.PERMISSIONS.UPDATE : ROLE_CONFIG.PERMISSIONS.WRITE,
  roleSchema,
  async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        permissionIds: data.permissionIds,
      };

      let result;
      if (data.id) {
        result = await updateRoleService(data.id, payload);
      } else {
        result = await createRoleService(payload);
      }

      if (result.success) {
        revalidatePath(ROUTES.ADMIN.ROLES.path);
        return {
          success: true,
          message: data.id ? "Rol actualizado correctamente" : "Rol creado correctamente"
        };
      }

      return result;

    } catch (error) {
      logger.error("Error saving role", { error: error.message });
      return { success: false, error: "Error inesperado al guardar el rol" };
    }
  }
);

/**
 * Server Action para eliminar rol.
 */
export const deleteRoleAction = createProtectedFunction(
  ROLE_CONFIG.PERMISSIONS.DELETE,
  async (id) => {
    try {
      const result = await deleteRoleService(id);

      if (result.success) {
        revalidatePath(ROUTES.ADMIN.ROLES.path);
        return { success: true, message: "Rol eliminado correctamente" };
      }

      return result;

    } catch (error) {
      logger.error("Error deleting role", { error: error.message, roleId: id });
      return { success: false, error: "Error inesperado al eliminar el rol" };
    }
  }
);
