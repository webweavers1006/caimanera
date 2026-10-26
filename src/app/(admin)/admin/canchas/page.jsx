import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { CourtPageContainer } from "@/features/courts/components/CourtPageContainer";
import { COURT_CONFIG } from "@/features/courts";

const { LABELS } = COURT_CONFIG.UI;

export const metadata = {
  title: `${COURT_CONFIG.TITLE} | Caimanera`,
  description: LABELS.DESCRIPTION,
};

export default async function CourtsPage({ searchParams }) {
  const { authorized } = await checkPageAccess(COURT_CONFIG.PERMISSIONS.VIEW);

  if (!authorized) {
    return <AccessDenied />;
  }

  return <Suspense fallback={<TableSkeleton />}><CourtPageContainer searchParams={searchParams} /></Suspense>;
}
