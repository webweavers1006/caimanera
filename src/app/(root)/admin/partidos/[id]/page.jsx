import { checkPageAccess } from "@/features/auth/lib/auth-guard";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { MatchDetailPageContainer } from "@/features/matches/components/MatchDetailPageContainer";
import { MATCH_CONFIG } from "@/features/matches";

const { LABELS } = MATCH_CONFIG.UI;

export const metadata = {
  title: `Detalle de Partido | Caimanera`,
  description: LABELS.DESCRIPTION,
};

export default async function MatchDetailPage({ params }) {
  const { authorized } = await checkPageAccess(MATCH_CONFIG.PERMISSIONS.VIEW);

  if (!authorized) {
    return <AccessDenied />;
  }

  const { id } = await params;
  return <MatchDetailPageContainer matchId={id} />;
}
