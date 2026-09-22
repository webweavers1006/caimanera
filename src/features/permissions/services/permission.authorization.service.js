import { cache } from "react";
import { permissionReadRepository } from "../repositories/permission.read.repository";

/**
 * Internal cached loader — fetches all permission slugs for a role ONCE per request.
 * React.cache() deduplicates calls within the same render tree.
 * Safe to call from layouts, actions, services, and API routes.
 */
const _loadPermissionSlugs = cache(async (roleName) => {
  if (!roleName) return [];
  const permissions = await permissionReadRepository.findPermissionsByRole(roleName);
  return permissions.map(p => p.slug);
});

/**
 * Retrieves all permission slugs assigned to a role (Frontend Load).
 * Cached per request via React.cache() — safe to call multiple times.
 */
export async function getUserPermissions(roleName) {
  return _loadPermissionSlugs(roleName);
}

/**
 * Verifies if a role has access to a specific permission (Backend Check).
 * Uses the cached slug list — zero extra DB queries after the first call
 * within the same request.
 */
export async function verifyPermission(roleName, requiredSlug) {
  if (!requiredSlug) return true;
  const slugs = await _loadPermissionSlugs(roleName);
  return slugs.includes(requiredSlug);
}
