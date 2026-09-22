import { z } from "zod";

/**
 * Validation schema for the self-service password change flow.
 * Requires the current password (identity check) + new password + confirmation.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .max(128, "La contraseña no puede exceder 128 caracteres"),
    confirmPassword: z.string().min(1, "Confirma la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "La confirmación no coincide con la nueva contraseña",
  });
