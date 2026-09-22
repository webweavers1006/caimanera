import { matchWriteRepository } from "../repositories/match.write.repository";
import { validateMatchRules } from "./match.validation.service";
import { MATCH_CONFIG } from "../config/match.constants";
import { logger } from "@/features/shared";

const { MESSAGES } = MATCH_CONFIG.UI.LABELS;

export async function createMatch(data) {
  const validation = await validateMatchRules(data);
  if (!validation.success) return validation;

  try {
    const result = await matchWriteRepository.create(data);
    return { success: true, data: result, message: MESSAGES.SUCCESS.CREATE };
  } catch (error) {
    logger.error("Error creating match", { error: error.message });
    return { success: false, error: MESSAGES.ERROR.CREATE };
  }
}

export async function updateMatch(id, data) {
  const validation = await validateMatchRules(data, id);
  if (!validation.success) return validation;

  try {
    const result = await matchWriteRepository.update(id, data);
    return { success: true, data: result, message: MESSAGES.SUCCESS.UPDATE };
  } catch (error) {
    logger.error("Error updating match", { error: error.message, matchId: id });
    return { success: false, error: MESSAGES.ERROR.UPDATE };
  }
}

export async function deleteMatch(id) {
  try {
    await matchWriteRepository.softDelete(id);
    return { success: true, message: MESSAGES.SUCCESS.DELETE };
  } catch (error) {
    logger.error("Error deleting match", { error: error.message, matchId: id });
    return { success: false, error: MESSAGES.ERROR.DELETE };
  }
}
