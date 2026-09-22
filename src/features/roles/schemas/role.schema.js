import { z } from "zod";

export const roleSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  description: z.string().optional(),
  permissionIds: z.array(z.number()).min(1, "Debe seleccionar al menos un permiso"),
});
