"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { sendCredentials } from "../services/send-credentials.service";
import { USER_CONFIG } from "../config/user.constants";
import { logger } from "@/features/shared/lib/logger";
import { revalidatePath } from "next/cache";

/**
 * Sends login credentials to one or more users.
 *
 * If `userIds` is provided, sends only to those specific users.
 * Otherwise sends to ALL active users (bulk).
 *
 * @param {Object} params
 * @param {string[]} [params.userIds] - Specific user UUIDs to send to.
 * @param {string} [params.loginUrl] - Optional custom login URL.
 */
export const sendCredentialsAction = createProtectedFunction(
  USER_CONFIG.PERMISSIONS.UPDATE,
  async ({ userIds, loginUrl }, session) => {
    try {
      const result = await sendCredentials({
        userIds: userIds || undefined,
        actorUserId: session.id,
        loginUrl: loginUrl || undefined,
      });

      if (result.success || result.results?.length > 0) {
        revalidatePath(USER_CONFIG.PATH);
      }

      return result;
    } catch (error) {
      logger.error("sendCredentialsAction failed", { error: error.message });
      return { success: false, error: "Error inesperado al enviar credenciales.", results: [] };
    }
  }
);
