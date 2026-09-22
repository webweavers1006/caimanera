import { participantWriteRepository } from "../repositories/participant.write.repository";
import { validateParticipantRules } from "./participant.validation.service";
import { PARTICIPANT_CONFIG } from "../config/participant.constants";
import { logger } from "@/features/shared";

const { MESSAGES } = PARTICIPANT_CONFIG.UI.LABELS;

export async function createParticipant(data) {
  const validation = await validateParticipantRules(data);
  if (!validation.success) return validation;

  try {
    const result = await participantWriteRepository.create(data);
    return { success: true, data: result, message: MESSAGES.SUCCESS.CREATE };
  } catch (error) {
    logger.error("Error creating participant", { error: error.message });
    return { success: false, error: MESSAGES.ERROR.CREATE };
  }
}

export async function updateParticipant(id, data) {
  const validation = await validateParticipantRules(data, id);
  if (!validation.success) return validation;

  try {
    const result = await participantWriteRepository.update(id, data);
    return { success: true, data: result, message: MESSAGES.SUCCESS.UPDATE };
  } catch (error) {
    logger.error("Error updating participant", { error: error.message, participantId: id });
    return { success: false, error: MESSAGES.ERROR.UPDATE };
  }
}

export async function deleteParticipant(id) {
  try {
    await participantWriteRepository.delete(id);
    return { success: true, message: MESSAGES.SUCCESS.DELETE };
  } catch (error) {
    logger.error("Error deleting participant", { error: error.message, participantId: id });
    return { success: false, error: MESSAGES.ERROR.DELETE };
  }
}
