"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { SSE_MONITOR_CONFIG } from "../config/sse-monitor.constants";
import { fetchConnectionStats } from "../services/sse-monitor.read.service";

/**
 * Protected server action — requires sse_monitor:view permission (ADMIN only).
 * Returns live SSE connection statistics for the admin monitoring dashboard.
 */
export const getConnectionStatsAction = createProtectedFunction(
  SSE_MONITOR_CONFIG.PERMISSIONS.VIEW,
  async () => {
    return fetchConnectionStats();
  }
);
