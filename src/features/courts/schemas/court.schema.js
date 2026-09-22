import { z } from "zod";

// Coerces empty/null to undefined so the required check kicks in, and parses
// strings coming from number inputs (react-hook-form returns strings).
const requiredNumber = (min, max, message) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z
      .number({ required_error: message, invalid_type_error: message })
      .min(min, message)
      .max(max, message)
  );

export const courtSchema = z.object({
  id: z.any().optional(),
  name: z.string()
    .min(1, "El nombre es obligatorio")
    .max(255, "El nombre no puede exceder los 255 caracteres"),
  sport: z.string()
    .min(1, "El deporte es obligatorio")
    .max(100, "El deporte no puede exceder los 100 caracteres"),
  description: z.string()
    .max(1000, "La descripción no puede exceder los 1000 caracteres")
    .nullable()
    .optional(),
  address: z.string()
    .max(255, "La dirección no puede exceder los 255 caracteres")
    .nullable()
    .optional(),
  latitude: requiredNumber(-90, 90, "Latitud inválida (debe estar entre -90 y 90)"),
  longitude: requiredNumber(-180, 180, "Longitud inválida (debe estar entre -180 y 180)"),
  hourlyRate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: "La tarifa debe ser un número" })
      .min(0, "La tarifa no puede ser negativa")
      .optional()
  ),
  managerId: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  photos: z.array(z.string().min(1)).optional().default([]),
});
