import { z } from "zod";

export const participantSchema = z.object({
  id: z.any().optional(),
  userId: z.string().min(1, "El jugador es obligatorio"),
  matchId: z.string().min(1, "El partido es obligatorio"),
  status: z.enum(["CONFIRMED", "WAITLIST"]).optional().default("WAITLIST"),
  position: z
    .string()
    .max(50, "La posición no puede exceder los 50 caracteres")
    .optional()
    .or(z.literal("")),
  paymentType: z.enum(["PAY_PER_MATCH", "SUBSCRIPTION_CREDIT"]).optional().default("PAY_PER_MATCH"),
});
