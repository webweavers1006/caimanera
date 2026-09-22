"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { fetchAllRolesList, fetchRoleById } from "../services/role.read.service";
import { ROLE_CONFIG } from "../config/role.constants";

/**
 * Acción para obtener todos los roles (ligero) para selectores.
 */
export const getAllRolesListAction = createProtectedFunction(
  ROLE_CONFIG.PERMISSIONS.READ, 
  async () => {
    return await fetchAllRolesList();
  }
);

/**
 * Acción para obtener un rol con sus detalles completos (permisos).
 */
export const getRoleDetailsAction = createProtectedFunction(
  ROLE_CONFIG.PERMISSIONS.READ,
  async (id) => {
    if (!id) throw new Error("ID de rol requerido");
    return await fetchRoleById(id);
  }
);
