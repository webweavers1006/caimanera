"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { MATCH_CONFIG } from "../config/match.constants";
import { fetchMatchesList } from "../services/match.read.service";

export const getMatchesListAction = createProtectedFunction(
  MATCH_CONFIG.PERMISSIONS.READ,
  async (params) => {
    return fetchMatchesList(params);
  }
);
