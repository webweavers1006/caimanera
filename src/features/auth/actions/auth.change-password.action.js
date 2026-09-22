"use server";

import { createAuthenticatedFunction } from "@/features/shared/lib/safe-action";
import { changePasswordSchema } from "../schemas/change-password.schema";
import { changeUserPassword } from "../services/change-password.service";
import { createAuditEntry } from "@/features/audit-logs/services/audit-log.write.service";
import { logger } from "@/features/shared";

/**
 * Server Action for self-service password change.
 *
 * Uses createAuthenticatedFunction (CSRF + session, no RBAC permission):
 * any authenticated user may change their OWN password.
 * The current password is required to verify identity before the update.
 *
 * @param {Object} input - { currentPassword, newPassword, confirmPassword }
 * @param {Object} session - Injected session from createAuthenticatedFunction.
 */
export const changePasswordAction = createAuthenticatedFunction(async (input, session) => {
  const parsed = changePasswordSchema.safeParse(input);

  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      error: "Error de validación. Revisa los campos marcados.",
      details,
    };
  }

  const { currentPassword, newPassword } = parsed.data;

  const result = await changeUserPassword({
    userId: session.id,
    currentPassword,
    newPassword,
  });

  if (result.success) {
    // Audit log — fire and forget
    createAuditEntry({
      userId: session.id,
      action: "Cambio de contraseña (autoservicio)",
    }).catch((err) =>
      logger.error("Audit log failed for password change", {
        userId: session.id,
        error: err.message,
      })
    );
  }

  return result;
});
