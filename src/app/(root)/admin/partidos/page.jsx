import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { MatchPageContainer } from "@/features/matches/components/MatchPageContainer";
import { MATCH_CONFIG } from "@/features/matches";

const { LABELS } = MATCH_CONFIG.UI;

export const metadata = {
  title: `${MATCH_CONFIG.TITLE} | Caimanera`,
  description: LABELS.DESCRIPTION,
};

export default async function MatchesPage({ searchParams }) {
  const { authorized } = await checkPageAccess(MATCH_CONFIG.PERMISSIONS.VIEW);

  if (!authorized) {
    return <AccessDenied />;
  }

  return <Suspense fallback={<TableSkeleton />}><MatchPageContainer searchParams={searchParams} /></Suspense>;
}
