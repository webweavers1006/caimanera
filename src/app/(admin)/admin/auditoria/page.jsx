import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { AuditLogPageContainer } from "@/features/audit-logs/components/AuditLogPageContainer";
import { AUDIT_LOG_CONFIG } from "@/features/audit-logs";

export const metadata = {
  title: `${AUDIT_LOG_CONFIG.TITLE} | Caimanera`,
};

export default async function AuditLogPage({ searchParams }) {
  const { authorized } = await checkPageAccess(AUDIT_LOG_CONFIG.PERMISSIONS.VIEW);

  if (!authorized) {
    return <AccessDenied />;
  }

  return <Suspense fallback={<TableSkeleton />}><AuditLogPageContainer searchParams={searchParams} /></Suspense>;
}
