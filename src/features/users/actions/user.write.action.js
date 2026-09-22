"use server";

import { revalidatePath } from "next/cache";
import { userSchema } from "../schemas/user.schema";
import { createProtectedAction, createProtectedFunction } from "@/features/shared/lib/safe-action";
import { createUser, updateUser, deleteUser as deleteUserService } from "../services/user.write.service";
import { USER_CONFIG } from "../config/user.constants";

/**
 * Server Action to save (create/edit) a user.
 */
export const saveUser = createProtectedAction(
  (data) => data.id ? USER_CONFIG.PERMISSIONS.UPDATE : USER_CONFIG.PERMISSIONS.WRITE,
  userSchema,
  async (data) => {
    const { id, ...domainDto } = data;

    const result = id 
      ? await updateUser(id, domainDto) 
      : await createUser(domainDto);

    if (result.success) {
      revalidatePath(USER_CONFIG.PATH);
    }
    
    return result;
  }
);

/**
 * Server Action to delete user.
 */
export const deleteUser = createProtectedFunction(
  USER_CONFIG.PERMISSIONS.DELETE,
  async (id) => {
    const result = await deleteUserService(id);
    if (result.success) {
      revalidatePath(USER_CONFIG.PATH);
    }
    return result;
  }
);
