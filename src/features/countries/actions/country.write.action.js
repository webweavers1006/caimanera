"use server";
import { SHARED_CONFIG } from "@/features/shared";

import { createProtectedAction, createProtectedFunction } from "@/features/shared/lib/safe-action";
import {
  createCountry,
  updateCountry,
  deleteCountry,
} from "../services/country.write.service";
import { COUNTRY_CONFIG } from "../config/country.constants";
import { countrySchema } from "../schemas/country.schema";
import { logger } from "@/features/shared/lib/logger";
import { revalidatePath } from "next/cache";

export const saveCountryAction = createProtectedAction(
  (data) => data.id ? COUNTRY_CONFIG.PERMISSIONS.UPDATE : COUNTRY_CONFIG.PERMISSIONS.WRITE,
  countrySchema,
  async (data) => {
    try {
      const { id, ...rest } = data;

      let result;
      if (id) {
        result = await updateCountry(id, rest);
      } else {
        result = await createCountry(rest);
      }

      if (result.success) {
        revalidatePath(COUNTRY_CONFIG.PATH);
      }
      return result;
    } catch (error) {
      logger.error("Failed to save country", { error: error.message });
      return { success: false, error: SHARED_CONFIG.UI.LABELS.MESSAGES.UNEXPECTED_SERVER_ERROR };
    }
  }
);

export const deleteCountryAction = createProtectedFunction(
  COUNTRY_CONFIG.PERMISSIONS.DELETE,
  async (id) => {
    try {
      const result = await deleteCountry(id);
      if (result.success) {
        revalidatePath(COUNTRY_CONFIG.PATH);
      }
      return result;
    } catch (error) {
      logger.error("Failed to delete country", { error: error.message, countryId: id });
      return { success: false, error: SHARED_CONFIG.UI.LABELS.MESSAGES.UNEXPECTED_DELETE_ERROR };
    }
  }
);
