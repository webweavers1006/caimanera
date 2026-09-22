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

export const subscriptionSchema = z.object({
  id: z.any().optional(),
  name: z.string()
    .min(1, "El nombre es obligatorio")
    .max(255, "El nombre no puede exceder los 255 caracteres"),
  tier: z.enum(["BASIC_PASS", "PRO_MONTHLY", "VIP_ANNUAL"]).optional().default("BASIC_PASS"),
  price: requiredNumber(0, "El precio no puede ser negativo"),
  matchesIncluded: requiredInt(0, 1000000, "Los partidos incluidos deben estar entre 0 y 1000000"),
  priorityBooking: z.boolean().optional().default(true),
  description: z.string()
    .max(1000, "La descripción no puede exceder los 1000 caracteres")
    .nullable()
    .optional(),
});
