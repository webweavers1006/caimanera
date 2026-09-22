import { z } from "zod";

export const permissionSchema = z.object({
  id: z.number().optional(),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .max(100, "El slug no puede exceder 100 caracteres")
    .regex(/^[a-z_]+:[a-z_]+$/, "El slug debe tener el formato 'modulo:accion' (ej: users:create)"),
  description: z.string().optional(),
});
