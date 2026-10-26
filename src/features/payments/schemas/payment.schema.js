import { z } from "zod";
import { PAYMENT_METHOD_VALUES } from "../config/payment.constants";

export const matchPaymentSchema = z.object({
  matchId: z.string().min(1, "El partido es obligatorio"),
  method: z.enum(PAYMENT_METHOD_VALUES),
  reference: z
    .string()
    .trim()
    .max(120, "La referencia no puede superar los 120 caracteres")
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
});
