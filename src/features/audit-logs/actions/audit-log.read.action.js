"use server";

import { createProtectedFunction } from "@/features/shared/lib/safe-action";
import { AUDIT_LOG_CONFIG } from "../config/audit-log.constants";
import { fetchAuditLogsList } from "../services/audit-log.read.service";

export const getAuditLogsAction = createProtectedFunction(
  AUDIT_LOG_CONFIG.PERMISSIONS.READ,
  async (params) => {
    return await fetchAuditLogsList(params);
  }
);
