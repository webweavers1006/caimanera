import { z } from "zod";

// Coerces empty/null to undefined so the required check kicks in, and parses
// strings coming from number inputs (react-hook-form returns strings).
const requiredInt = (min, max, message) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z
      .number({ required_error: message, invalid_type_error: message })
      .int("Debe ser un número entero")
      .min(min, message)
      .max(max, message)
  );

const requiredNumber = (min, message) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z
      .number({ required_error: message, invalid_type_error: message })
      .min(min, message)
  );

export const matchSchema = z.object({
  id: z.any().optional(),
  title: z.string()
    .min(1, "El título es obligatorio")
    .max(255, "El título no puede exceder los 255 caracteres"),
  sport: z.string()
    .min(1, "El deporte es obligatorio")
    .max(100, "El deporte no puede exceder los 100 caracteres"),
  scheduledAt: z.string()
    .min(1, "La fecha es obligatoria")
    .refine((val) => !Number.isNaN(new Date(val).getTime()), "Fecha inválida"),
  durationMins: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: "La duración debe ser un número" })
      .int("La duración debe ser un número entero")
      .min(15, "La duración mínima es 15 minutos")
      .max(600, "La duración máxima es 600 minutos")
      .optional()
      .default(60)
  ),
  capacity: requiredInt(1, 1000, "La capacidad debe estar entre 1 y 1000"),
  pricePerSlot: requiredNumber(0, "El precio no puede ser negativo"),
  allowSubscription: z.boolean().optional().default(true),
  status: z.enum(["OPEN", "FULL", "IN_PROGRESS", "COMPLETED", "CANCELED"]).optional().default("OPEN"),
  hostId: z.string().min(1, "El organizador es obligatorio"),
  courtId: z.string().min(1, "La cancha es obligatoria"),
});
