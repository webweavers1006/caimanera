"use server";

import { SHARED_CONFIG } from "@/features/shared";
import { createProtectedAction, createProtectedFunction } from "@/features/shared/lib/safe-action";
import {
  createParticipant,
  updateParticipant,
  deleteParticipant,
} from "../services/participant.write.service";
import { PARTICIPANT_CONFIG } from "../config/participant.constants";
import { participantSchema } from "../schemas/participant.schema";
import { logger } from "@/features/shared/lib/logger";
import { revalidatePath } from "next/cache";

export const saveParticipantAction = createProtectedAction(
  (data) => data.id ? PARTICIPANT_CONFIG.PERMISSIONS.UPDATE : PARTICIPANT_CONFIG.PERMISSIONS.WRITE,
  participantSchema,
  async (data) => {
    try {
      const { id, ...rest } = data;

      let result;
      if (id) {
        result = await updateParticipant(id, rest);
      } else {
        result = await createParticipant(rest);
      }

      if (result.success) {
        revalidatePath(PARTICIPANT_CONFIG.PATH);
      }
      return result;
    } catch (error) {
      logger.error("Failed to save participant", { error: error.message });
      return { success: false, error: SHARED_CONFIG.UI.LABELS.MESSAGES.UNEXPECTED_SERVER_ERROR };
    }
  }
);

export const deleteParticipantAction = createProtectedFunction(
  PARTICIPANT_CONFIG.PERMISSIONS.DELETE,
  async (id) => {
    try {
      const result = await deleteParticipant(id);
      if (result.success) {
        revalidatePath(PARTICIPANT_CONFIG.PATH);
      }
      return result;
    } catch (error) {
      logger.error("Failed to delete participant", { error: error.message, participantId: id });
      return { success: false, error: SHARED_CONFIG.UI.LABELS.MESSAGES.UNEXPECTED_DELETE_ERROR };
    }
  }
);
