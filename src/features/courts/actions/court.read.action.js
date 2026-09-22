"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { COURT_CONFIG } from "../config/court.constants";
import { fetchCourtsList } from "../services/court.read.service";

export const getCourtsListAction = createProtectedFunction(
  COURT_CONFIG.PERMISSIONS.READ,
  async (params) => {
    return fetchCourtsList(params);
  }
);
