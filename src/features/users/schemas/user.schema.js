import { z } from "zod";

/**
 * Esquema de validación para Usuarios simplificado.
 */
export const userSchema = z.object({
  id: z.string().nullish().or(z.literal('')),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  idCard: z.string().min(3, "La cédula es obligatoria"),
  email: z.string().email("Email inválido"),
  roleId: z.coerce.number().min(1, "Debes seleccionar un rol"),
  administrativeDirectionId: z.any().optional(),
  attentionChannelId: z.any().optional(),
  officeId: z.any().optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal('')),
  isActive: z.preprocess(
    (val) => val === 'on' || val === 'true' || val === true,
    z.boolean()
  ).default(true),
});
