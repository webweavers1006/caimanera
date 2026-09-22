import { findUserByUniqueFields } from "../repositories/user.read.repository";
import { logger } from "@/features/shared";

/**
 * Valida la unicidad del usuario (cédula y email).
 * @param {string} idCard - Cédula del usuario
 * @param {string} email - Email del usuario
 * @param {string|null} currentId - ID del usuario si se está editando
 */
export async function validateUserUniqueness(idCard, email, currentId = null) {
  try {
    const existing = await findUserByUniqueFields(idCard, email, currentId);

    if (existing) {
      if (existing.idCard === idCard) {
        return {
          success: false,
          error: "La cédula ya está registrada.",
          details: { idCard: ["La cédula ya está registrada."] }
        };
      }
      if (existing.email === email) {
        return {
          success: false,
          error: "El email ya está registrado.",
          details: { email: ["El email ya está registrado."] }
        };
      }
    }

    return { success: true };
  } catch (error) {
    logger.error("Error validating user uniqueness", { error: error.message });
    return { success: false, error: "Error de validación en el servidor." };
  }
}
