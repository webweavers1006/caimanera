import { verifyPermission } from "@/features/permissions/services/permission.authorization.service";
import { getVisibleUserIds } from "@/features/shared/services/hierarchy.service";
import { logger } from "@/features/shared/lib/logger";

/**
 * Scope Filter Factory — builds Prisma WHERE clauses for row-level security.
 *
 * Resolution order:
 *   1. readAllPermission → {} (no filter, sees everything)
 *   2. Is leader/supervisor → { userField: { in: visibleUserIds } }
 *   3. allowSelf → { userField: currentUser.id }
 *   4. Default → { userField: "DENIED" }
 *
 * @param {Object} params
 * @param {Object} params.currentUser - Session user { id, role }
 * @param {string} [params.readAllPermission] - Permission slug for full access
 * @param {string} [params.userField='userId'] - Prisma field for the user owner
 * @param {boolean} [params.allowSelf=true] - Allow users to see own records
 * @returns {Promise<Object>} Prisma where clause
 */
export async function createScopeFilter({
  currentUser,
  readAllPermission,
  userField = "userId",
  allowSelf = true,
}) {
  if (!currentUser) return { [userField]: "DENIED" };

  try {
    // 1. Global read-all → no filter
    if (readAllPermission) {
      const canReadAll = await verifyPermission(currentUser.role, readAllPermission);
      if (canReadAll) return {};
    }

    // 2. Hierarchy: leader / supervisor → visible users
    const visibleIds = await getVisibleUserIds(currentUser.id);

    if (visibleIds.length > 1) {
      // Has subordinates (more than just self)
      if (allowSelf) {
        return { [userField]: { in: visibleIds } };
      }
      // Exclude self if not allowed
      const others = visibleIds.filter(id => id !== currentUser.id);
      if (others.length > 0) {
        return { [userField]: { in: others } };
      }
    }

    // 3. Self only
    if (allowSelf) {
      return { [userField]: currentUser.id };
    }

    // 4. Denied
    return { [userField]: "DENIED" };
  } catch (error) {
    logger.error("createScopeFilter error", { error: error.message });
    return { [userField]: "DENIED" };
  }
}
