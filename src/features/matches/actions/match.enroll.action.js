"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { revalidatePath } from "next/cache";
import { enrollCurrentUserInMatch } from "../services/match.enroll.service";
import { MATCH_CONFIG } from "../config/match.constants";

export const enrollInMatchAction = createProtectedFunction(
  "participants:create",
  async (matchId, session) => {
    const result = await enrollCurrentUserInMatch(matchId, session.id);
    if (result.success) {
      revalidatePath(MATCH_CONFIG.PATH);
    }
    return result;
  }
);
