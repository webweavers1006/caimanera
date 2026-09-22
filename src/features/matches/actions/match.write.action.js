"use server";
import { SHARED_CONFIG } from "@/features/shared";

import { createProtectedAction, createProtectedFunction } from "@/features/shared/lib/safe-action";
import {
  createMatch,
  updateMatch,
  deleteMatch,
} from "../services/match.write.service";
import { MATCH_CONFIG } from "../config/match.constants";
import { matchSchema } from "../schemas/match.schema";
import { logger } from "@/features/shared/lib/logger";
import { revalidatePath } from "next/cache";

export const saveMatchAction = createProtectedAction(
  (data) => data.id ? MATCH_CONFIG.PERMISSIONS.UPDATE : MATCH_CONFIG.PERMISSIONS.WRITE,
  matchSchema,
  async (data) => {
    try {
      const { id, ...rest } = data;

      let result;
      if (id) {
        result = await updateMatch(id, rest);
      } else {
        result = await createMatch(rest);
      }

      if (result.success) {
        revalidatePath(MATCH_CONFIG.PATH);
      }
      return result;
    } catch (error) {
      logger.error("Failed to save match", { error: error.message });
      return { success: false, error: SHARED_CONFIG.UI.LABELS.MESSAGES.UNEXPECTED_SERVER_ERROR };
    }
  }
);

export const deleteMatchAction = createProtectedFunction(
  MATCH_CONFIG.PERMISSIONS.DELETE,
  async (id) => {
    try {
      const result = await deleteMatch(id);
      if (result.success) {
        revalidatePath(MATCH_CONFIG.PATH);
      }
      return result;
    } catch (error) {
      logger.error("Failed to delete match", { error: error.message, matchId: id });
      return { success: false, error: SHARED_CONFIG.UI.LABELS.MESSAGES.UNEXPECTED_DELETE_ERROR };
    }
  }
);
