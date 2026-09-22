"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { PARTICIPANT_CONFIG } from "../config/participant.constants";
import { fetchParticipantsList } from "../services/participant.read.service";

export const getParticipantsListAction = createProtectedFunction(
  PARTICIPANT_CONFIG.PERMISSIONS.READ,
  async (params) => {
    return fetchParticipantsList(params);
  }
);
