"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { getAllSystemPermissions, fetchPermissionById } from "../services/permission.read.service";
import { PERMISSION_CONFIG } from "../config/permission.constants";

/**
 * Protected Server Action — fetches the full system permission catalog.
 * Used by server components and client permission selectors.
 */
export const getAllSystemPermissionsAction = createProtectedFunction(
  PERMISSION_CONFIG.PERMISSIONS.READ,
  async () => {
    return await getAllSystemPermissions();
  }
);

/**
 * Protected Server Action — fetches a single permission by ID for the edit form.
 */
export const getPermissionDetailsAction = createProtectedFunction(
  PERMISSION_CONFIG.PERMISSIONS.READ,
  async (id) => {
    if (!id) throw new Error("ID de permiso requerido");
    return await fetchPermissionById(id);
  }
);
