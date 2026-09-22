"use server";
import { SHARED_CONFIG } from "@/features/shared";

import { createProtectedAction, createProtectedFunction } from "@/features/shared/lib/safe-action";
import {
  createCourt,
  updateCourt,
  deleteCourt,
} from "../services/court.write.service";
import { COURT_CONFIG } from "../config/court.constants";
import { courtSchema } from "../schemas/court.schema";
import { logger } from "@/features/shared/lib/logger";
import { revalidatePath } from "next/cache";

export const saveCourtAction = createProtectedAction(
  (data) => data.id ? COURT_CONFIG.PERMISSIONS.UPDATE : COURT_CONFIG.PERMISSIONS.WRITE,
  courtSchema,
  async (data) => {
    try {
      const { id, ...rest } = data;

      let result;
      if (id) {
        result = await updateCourt(id, rest);
      } else {
        result = await createCourt(rest);
      }

      if (result.success) {
        revalidatePath(COURT_CONFIG.PATH);
      }
      return result;
    } catch (error) {
      logger.error("Failed to save court", { error: error.message });
      return { success: false, error: SHARED_CONFIG.UI.LABELS.MESSAGES.UNEXPECTED_SERVER_ERROR };
    }
  }
);

export const deleteCourtAction = createProtectedFunction(
  COURT_CONFIG.PERMISSIONS.DELETE,
  async (id) => {
    try {
      const result = await deleteCourt(id);
      if (result.success) {
        revalidatePath(COURT_CONFIG.PATH);
      }
      return result;
    } catch (error) {
      logger.error("Failed to delete court", { error: error.message, courtId: id });
      return { success: false, error: SHARED_CONFIG.UI.LABELS.MESSAGES.UNEXPECTED_DELETE_ERROR };
    }
  }
);
