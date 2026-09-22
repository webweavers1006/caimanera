"use server";
import { SHARED_CONFIG } from "@/features/shared";

import { revalidatePath } from "next/cache";
import { permissionSchema } from "../schemas/permission.schema";
import {
  createPermission as createPermissionService,
  updatePermission as updatePermissionService,
  deletePermission as deletePermissionService,
} from "../services/permission.write.service";
import { createProtectedAction, createProtectedFunction } from "@/features/shared/lib/safe-action";
import { PERMISSION_CONFIG } from "../config/permission.constants";
import { logger } from "@/features/shared";

/**
 * Server Action — creates or updates a permission.
 */
export const savePermissionAction = createProtectedAction(
  (data) => (data.id ? PERMISSION_CONFIG.PERMISSIONS.UPDATE : PERMISSION_CONFIG.PERMISSIONS.WRITE),
  permissionSchema,
  async (data) => {
    try {
      const payload = {
        slug: data.slug,
        description: data.description,
      };

      let result;
      if (data.id) {
        result = await updatePermissionService(data.id, payload);
      } else {
        result = await createPermissionService(payload);
      }

      if (result.success) {
        revalidatePath(PERMISSION_CONFIG.PATH);
        return {
          success: true,
          message: data.id ? "Permiso actualizado correctamente" : "Permiso creado correctamente",
        };
      }

      return result;
    } catch (error) {
      logger.error("Error saving permission", { error: error.message });
      return { success: false, error: "Error inesperado al guardar el permiso" };
    }
  }
);

/**
 * Server Action — deletes a permission (soft delete).
 */
export const deletePermissionAction = createProtectedFunction(
  PERMISSION_CONFIG.PERMISSIONS.DELETE,
  async (id) => {
    try {
      const result = await deletePermissionService(id);

      if (result.success) {
        revalidatePath(PERMISSION_CONFIG.PATH);
        return { success: true, message: "Permiso eliminado correctamente" };
      }

      return result;
    } catch (error) {
      logger.error("Error deleting permission", { error: error.message, permissionId: id });
      return { success: false, error: "Error inesperado al eliminar el permiso" };
    }
  }
);
