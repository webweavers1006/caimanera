import bcrypt from "bcryptjs";
import crypto from "crypto";
import { 
  createUser as createRepo, 
  updateUser as updateRepo, 
  deleteUser as deleteRepo 
} from "../repositories/user.write.repository";
import { fetchRoleByName } from "@/features/roles/services/role.read.service";
import { validateUserUniqueness } from "./user.validation.service";
import { USER_CONFIG } from "../config/user.constants";
import { logger } from "@/features/shared";

const DEFAULT_ROLE_NAME = "EMPLEADO";
const { MESSAGES } = USER_CONFIG.UI.LABELS;

/**
 * Creates a new user.
 */
export async function createUser(data) {
  try {
    const uniquenessCheck = await validateUserUniqueness(data.idCard, data.email);
    if (!uniquenessCheck.success) return uniquenessCheck;

    // Generate a secure random password if none provided.
    // Never fall back to the ID card (predictable 6-8 digit number).
    const passwordToHash = data.password || crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(passwordToHash, 12);

    // Resolve default role if not specified
    let roleId = data.roleId;
    if (!roleId) {
      const rolEmpleado = await fetchRoleByName(DEFAULT_ROLE_NAME);
      roleId = rolEmpleado?.id;
    }

    const domainDto = {
      ...data,
      password: hashedPassword,
      roleId,
      isActive: true
    };

    const user = await createRepo(domainDto);

    return { success: true, data: user, message: MESSAGES.SUCCESS.SAVE };
  } catch (error) {
    logger.error("Error creating user", { error: error.message, idCard: data?.idCard ? "[REDACTED]" : undefined });
    return { success: false, error: MESSAGES.ERROR.SAVE || "Error al crear el usuario." };
  }
}

/**
 * Updates an existing user.
 */
export async function updateUser(id, data) {
  try {
    const domainDto = { ...data };

    // Only hash if a new password is provided
    if (data.password && data.password.trim() !== "") {
      domainDto.password = await bcrypt.hash(data.password, 12);
    } else {
      delete domainDto.password;
    }

    const user = await updateRepo(id, domainDto);
    return { success: true, data: user, message: MESSAGES.SUCCESS.SAVE };
  } catch (error) {
    logger.error("Error updating user", { error: error.message, userId: id });
    return { success: false, error: MESSAGES.ERROR.SAVE || "Error al actualizar el usuario." };
  }
}

/**
 * Soft-deletes a user.
 */
export async function deleteUser(id) {
  try {
    await deleteRepo(id);
    return { success: true, message: MESSAGES.SUCCESS.DELETE };
  } catch (error) {
    logger.error("Error deleting user", { error: error.message, userId: id });
    return { success: false, error: MESSAGES.ERROR.DELETE || "Error al eliminar el usuario." };
  }
}
