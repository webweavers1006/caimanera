import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/shared/table/TableSkeleton";
import { ParticipantPageContainer } from "@/features/participants/components/ParticipantPageContainer";
import { PARTICIPANT_CONFIG } from "@/features/participants";

const { LABELS } = PARTICIPANT_CONFIG.UI;

export const metadata = {
  title: `${PARTICIPANT_CONFIG.TITLE} | Caimanera`,
  description: LABELS.DESCRIPTION,
};

export default async function ParticipantsPage({ searchParams }) {
  const { authorized } = await checkPageAccess(PARTICIPANT_CONFIG.PERMISSIONS.VIEW);

  if (!authorized) {
    return <AccessDenied />;
  }

  return (
    <Suspense fallback={<TableSkeleton />}>
      <ParticipantPageContainer searchParams={searchParams} />
    </Suspense>
  );
}
