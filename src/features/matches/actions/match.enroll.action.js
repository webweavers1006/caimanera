"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { revalidatePath } from "next/cache";
import {
  enrollCurrentUserInMatch,
  leaveCurrentUserFromMatch,
} from "../services/match.enroll.service";
import { MATCH_CONFIG } from "../config/match.constants";
import { DISCOVERY_CONFIG } from "@/features/discovery/config/discovery.constants";
import { PARTICIPANT_CONFIG } from "@/features/participants/config/participant.constants";

function revalidateMatchPaths(matchId) {
  revalidatePath(DISCOVERY_CONFIG.PATHS.HOME);
  revalidatePath(DISCOVERY_CONFIG.PATHS.MATCHES);
  revalidatePath(`${DISCOVERY_CONFIG.PATHS.MATCHES}/${matchId}`);
  revalidatePath(DISCOVERY_CONFIG.PATHS.MY_MATCHES);
  revalidatePath(MATCH_CONFIG.PATH);
  revalidatePath(`${MATCH_CONFIG.PATH}/${matchId}`);
  revalidatePath(PARTICIPANT_CONFIG.PATH);
}

export const enrollInMatchAction = createProtectedFunction(
  PARTICIPANT_CONFIG.PERMISSIONS.SELF_ENROLL,
  async (matchId, session) => {
    const result = await enrollCurrentUserInMatch(matchId, session.id);
    if (result.success) revalidateMatchPaths(matchId);
    return result;
  }
);

export const leaveInMatchAction = createProtectedFunction(
  PARTICIPANT_CONFIG.PERMISSIONS.SELF_ENROLL,
  async (matchId, session) => {
    const result = await leaveCurrentUserFromMatch(matchId, session.id);
    if (result.success) revalidateMatchPaths(matchId);
    return result;
  }
);
