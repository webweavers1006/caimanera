import { courtWriteRepository } from "../repositories/court.write.repository";
import { validateCourtRules } from "./court.validation.service";
import { COURT_CONFIG } from "../config/court.constants";
import { logger } from "@/features/shared";

const { MESSAGES } = COURT_CONFIG.UI.LABELS;

export async function createCourt(data) {
  const validation = await validateCourtRules(data);
  if (!validation.success) return validation;

  try {
    const result = await courtWriteRepository.create(data);
    return { success: true, data: result, message: MESSAGES.SUCCESS.CREATE };
  } catch (error) {
    logger.error("Error creating court", { error: error.message });
    return { success: false, error: MESSAGES.ERROR.CREATE };
  }
}

export async function updateCourt(id, data) {
  const validation = await validateCourtRules(data, id);
  if (!validation.success) return validation;

  try {
    const result = await courtWriteRepository.update(id, data);
    return { success: true, data: result, message: MESSAGES.SUCCESS.UPDATE };
  } catch (error) {
    logger.error("Error updating court", { error: error.message, courtId: id });
    return { success: false, error: MESSAGES.ERROR.UPDATE };
  }
}

export async function deleteCourt(id) {
  try {
    await courtWriteRepository.softDelete(id);
    return { success: true, message: MESSAGES.SUCCESS.DELETE };
  } catch (error) {
    logger.error("Error deleting court", { error: error.message, courtId: id });
    return { success: false, error: MESSAGES.ERROR.DELETE };
  }
}
