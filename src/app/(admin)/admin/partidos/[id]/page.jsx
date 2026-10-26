import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { verifyPermission } from "@/features/permissions/services/permission.authorization.service";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { MatchDetailPageContainer } from "@/features/matches/components/MatchDetailPageContainer";
import { MATCH_CONFIG } from "@/features/matches";

const { LABELS } = MATCH_CONFIG.UI;

export const metadata = {
  title: `Detalle de Partido | Caimanera`,
  description: LABELS.DESCRIPTION,
};

export default async function MatchDetailPage({ params }) {
  const { authorized, session } = await checkPageAccess(MATCH_CONFIG.PERMISSIONS.VIEW);

  if (!authorized) {
    return <AccessDenied />;
  }

  const canViewParticipants = await verifyPermission(session.role, "participants:read");
  const { id } = await params;
  return (
    <MatchDetailPageContainer
      matchId={id}
      session={session}
      canViewParticipants={canViewParticipants}
    />
  );
}
