import { z } from "zod";
import { PASS_PAYMENT_METHOD_VALUES } from "@/features/payments/config/payment.constants";

export const subscriptionPurchaseSchema = z.object({
  planId: z.string().min(1, "El plan es obligatorio"),
  method: z.enum(PASS_PAYMENT_METHOD_VALUES),
  reference: z
    .string()
    .trim()
    .max(120, "La referencia no puede superar los 120 caracteres")
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
});
