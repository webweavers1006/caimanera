import { getSession } from "@/features/auth/lib/auth";
import { verifyPermission } from "@/features/permissions/services/permission.authorization.service";
import { redirect } from "next/navigation";

/**
 * Verifica si el usuario actual tiene acceso a un recurso.
 * Redirige a login si no hay sesión.
 * 
 * @param {string} requiredSlug - Slug del permiso requerido (ej. 'users:read')
 * @returns {Promise<{authorized: boolean, session: object}>}
 */
export async function checkPageAccess(requiredSlug) {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const authorized = await verifyPermission(session.role, requiredSlug);

  return { authorized, session };
}
