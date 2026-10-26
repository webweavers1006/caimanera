"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/features/shared";
import { createProtectedAction } from "@/features/shared/lib/safe-action";
import { verifyPermission } from "@/features/permissions/services/permission.authorization.service";
import { PARTICIPANT_CONFIG } from "@/features/participants/config/participant.constants";
import { MATCH_CONFIG } from "@/features/matches/config/match.constants";
import { matchPaymentSchema } from "../schemas/payment.schema";
import { payAndEnrollCurrentUserInMatch } from "../services/match.payment.service";

function revalidateMatchPaths(matchId) {
  revalidatePath(ROUTES.PLAYER.HOME.path);
  revalidatePath(ROUTES.PUBLIC.MATCHES.path);
  revalidatePath(`${ROUTES.PUBLIC.MATCHES.path}/${matchId}`);
  revalidatePath(ROUTES.PUBLIC.COURTS.path);
  revalidatePath(ROUTES.PLAYER.MY_MATCHES.path);
  revalidatePath(MATCH_CONFIG.PATH);
  revalidatePath(`${MATCH_CONFIG.PATH}/${matchId}`);
  revalidatePath(PARTICIPANT_CONFIG.PATH);
}

/**
 * Creates the enrollment and its payment transaction in one operation.
 *
 * BDT, mobile payment, Binance and card transactions are left in PENDING
 * state until the corresponding gateway webhook (or an admin reconciliation)
 * confirms them. Roles with participants:create can confirm without paying.
 */
export const payAndEnrollInMatchAction = createProtectedAction(
  PARTICIPANT_CONFIG.PERMISSIONS.SELF_ENROLL,
  matchPaymentSchema,
  async (data, session) => {
    const isStaffBypass = data.method === "STAFF_BYPASS";
    const staffBypass = isStaffBypass
      ? await verifyPermission(session.role, PARTICIPANT_CONFIG.PERMISSIONS.WRITE)
      : false;

    if (isStaffBypass && !staffBypass) {
      return {
        success: false,
        error: "Tu rol no puede confirmar participaciones sin pago.",
      };
    }

    const result = await payAndEnrollCurrentUserInMatch({
      matchId: data.matchId,
      userId: session.id,
      method: data.method,
      reference: data.reference,
      staffBypass,
    });

    if (result.success) revalidateMatchPaths(data.matchId);
    return result;
  }
);
